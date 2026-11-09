#!/usr/bin/env bash
# ZTV 24/7 server setup for a fresh Ubuntu 24.04 VM (Spaceship Starlight).
# Run from the unzipped folder:  sudo bash ztv-kick/server/setup.sh
# Safe to run again later: it re-copies the ZTV files and restarts the stream.
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Run it with sudo: sudo bash $0"; exit 1; }
HERE="$(cd "$(dirname "$0")" && pwd)"; SITE="$(dirname "$HERE")"
export DEBIAN_FRONTEND=noninteractive

echo "== Installing packages"
timedatectl set-timezone America/Chicago 2>/dev/null || ln -sf /usr/share/zoneinfo/America/Chicago /etc/localtime   # guide times in Central
apt-get update -q
apt-get install -y -q nginx xvfb x11-utils xdotool pulseaudio pulseaudio-utils ffmpeg stunnel4 fonts-noto-cjk \
  fonts-dejavu fonts-noto-color-emoji wget ca-certificates unzip
if ! command -v google-chrome >/dev/null; then
  wget -qO /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  apt-get install -y -q /tmp/chrome.deb && rm -f /tmp/chrome.deb
fi

echo "== Network tuning for a steady stream"
# BBR handles congested routes better; IPv4 avoids IPv6 stalls some hosts have on long uploads
printf 'net.core.default_qdisc=fq\nnet.ipv4.tcp_congestion_control=bbr\n' >/etc/sysctl.d/99-ztv.conf
sysctl --system >/dev/null
grep -q '^precedence ::ffff:0:0/96' /etc/gai.conf 2>/dev/null || echo 'precedence ::ffff:0:0/96  100' >>/etc/gai.conf

echo "== ZTV user and files"
id ztv >/dev/null 2>&1 || useradd -m -s /bin/bash ztv
mkdir -p /var/www/ztv /opt/ztv /etc/ztv
for f in index.html css js data bumpers assets audio; do [ -e "$SITE/$f" ] || continue; rm -rf "/var/www/ztv/$f"; cp -r "$SITE/$f" /var/www/ztv/; done
chown -R www-data:www-data /var/www/ztv
install -m 755 "$HERE/run.sh" /opt/ztv/run.sh
if [ ! -f /etc/ztv/stream.env ]; then install -m 600 "$HERE/stream.env.example" /etc/ztv/stream.env; fi

echo "== Local web server (only this machine can see it)"
cat >/etc/nginx/sites-available/ztv <<'NGX'
server {
  listen 127.0.0.1:8080;
  root /var/www/ztv;
  index index.html;
  add_header Cache-Control "no-cache";
  # heartbeat from the page (every 10s); run.sh reopens Chrome if these stop
  location = /hb { access_log /var/log/nginx/ztv-hb.log; add_header Cache-Control "no-store"; return 204; }
}
NGX
ln -sf /etc/nginx/sites-available/ztv /etc/nginx/sites-enabled/ztv
nginx -t && systemctl reload nginx || systemctl restart nginx

echo "== Stream service"
cat >/etc/systemd/system/ztv-stream.service <<'UNIT'
[Unit]
Description=ZTV 24/7 stream to Kick
After=network-online.target nginx.service
Wants=network-online.target

[Service]
User=ztv
WorkingDirectory=/home/ztv
EnvironmentFile=/etc/ztv/stream.env
RuntimeDirectory=ztv
Environment=XDG_RUNTIME_DIR=/run/ztv
ExecStart=/opt/ztv/run.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT
# a fresh start three times a day (Central) keeps Chrome from slowly eating memory. Keep in step with restarts.times in data/extras.js
RESTART_TIMES="${RESTART_TIMES:-04:00 12:00 20:00}"
cat >/etc/systemd/system/ztv-restart.service <<'UNIT'
[Unit]
Description=ZTV refresh
[Service]
Type=oneshot
ExecStart=/bin/systemctl restart ztv-stream.service
UNIT
# weekly dead video check: takes shows that vanished from archive.org out of the schedule (server/check-videos.py)
cat >/etc/systemd/system/ztv-check-videos.service <<UNIT
[Unit]
Description=ZTV weekly dead video check
After=network-online.target
[Service]
Type=oneshot
Nice=10
ExecStart=/usr/bin/python3 $SITE/server/check-videos.py
UNIT
cat >/etc/systemd/system/ztv-check-videos.timer <<'UNIT'
[Unit]
Description=ZTV dead video check, Sundays 5 AM Central
[Timer]
OnCalendar=Sun *-*-* 05:00:00 America/Chicago
Persistent=true
[Install]
WantedBy=timers.target
UNIT
{ echo "[Unit]"; echo "Description=ZTV refresh at $RESTART_TIMES Central"; echo "[Timer]"
  for t in $RESTART_TIMES; do echo "OnCalendar=*-*-* $t:00 America/Chicago"; done
  echo "Persistent=false"; echo "[Install]"; echo "WantedBy=timers.target"; } >/etc/systemd/system/ztv-restart.timer
systemctl daemon-reload
systemctl enable ztv-restart.timer >/dev/null; systemctl restart ztv-restart.timer
systemctl enable ztv-check-videos.timer >/dev/null; systemctl restart ztv-check-videos.timer
systemctl enable ztv-stream >/dev/null

if grep -q '^KICK_KEY=.\+' /etc/ztv/stream.env && grep -q '^KICK_URL=.\+' /etc/ztv/stream.env; then
  systemctl restart ztv-stream
  echo; echo "ZTV is streaming. Check it at https://kick.com/simplezombie"
  echo "Watch the log:  sudo journalctl -u ztv-stream -f"
else
  echo; echo "Almost done. Add your Kick Stream URL and Key:"
  echo "  sudo nano /etc/ztv/stream.env"
  echo "then start it:"
  echo "  sudo systemctl restart ztv-stream"
fi
