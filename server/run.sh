#!/usr/bin/env bash
# ZTV 24/7: opens the ZTV page in Chrome on a virtual screen and streams that screen + sound to Kick.
# systemd runs this (ztv-stream.service).
# Chrome and ffmpeg each restart on their own if they stop, so a hiccup in one doesn't take the stream down.
# Only if the virtual screen or sound card dies does the whole thing restart (systemd brings it back).
set -uo pipefail
: "${KICK_URL:?KICK_URL is empty, edit /etc/ztv/stream.env}"
: "${KICK_KEY:?KICK_KEY is empty, edit /etc/ztv/stream.env}"
W=${WIDTH:-1280}; H=${HEIGHT:-720}; FPS=${FPS:-30}
VB=${VIDEO_KBPS:-2500}; AB=${AUDIO_KBPS:-160}
PAGE=${PAGE_URL:-http://127.0.0.1:8080/?bc=1}
export DISPLAY=:99
export XDG_RUNTIME_DIR=${XDG_RUNTIME_DIR:-/tmp/ztv-run}
mkdir -p "$XDG_RUNTIME_DIR" && chmod 700 "$XDG_RUNTIME_DIR"
log(){ echo "ZTV: $*"; }

cleanup(){ trap - EXIT; kill $(jobs -p) 2>/dev/null; pkill -u "$(id -u)" -f "user-data-dir=$HOME/.ztv-chrome" 2>/dev/null; pulseaudio --kill 2>/dev/null; pkill -u "$(id -u)" -x pulseaudio 2>/dev/null; }
trap cleanup EXIT
trap 'exit 0' TERM INT

# 1. virtual screen
Xvfb :99 -screen 0 "${W}x${H}x24" -nolisten tcp 2>/dev/null &
XVFB=$!
for i in $(seq 50); do xdpyinfo -display :99 >/dev/null 2>&1 && break; sleep 0.2; done

# 2. virtual sound card that ffmpeg records from
# clear out any leftover sound servers from earlier runs (they pile up and fight over the audio),
# and stop Chrome from quietly starting its own extra copy
pulseaudio --kill 2>/dev/null; pkill -u "$(id -u)" -x pulseaudio 2>/dev/null; sleep 0.5
pkill -KILL -u "$(id -u)" -x pulseaudio 2>/dev/null
mkdir -p "$HOME/.config/pulse" && printf 'autospawn = no\n' >"$HOME/.config/pulse/client.conf"
pulseaudio -D --exit-idle-time=-1 --disallow-exit --resample-method=speex-float-1 2>/dev/null
for i in $(seq 25); do pactl info >/dev/null 2>&1 && break; sleep 0.2; done
pactl load-module module-null-sink sink_name=ztv rate=48000 sink_properties=device.description=ZTV >/dev/null
pactl set-default-sink ztv
export PULSE_SERVER="unix:$XDG_RUNTIME_DIR/pulse/native"   # everything uses this one sound server

# Chrome asks the sound card for tiny audio buffers by default, which makes pulseaudio wake up
# constantly and can eat a whole CPU core. 60 ms chunks are plenty for a TV stream.
export PULSE_LATENCY_MSEC=${PULSE_LATENCY_MSEC:-60}

# 3. the ZTV page, full screen, sound allowed without a click. Restarts itself if Chrome closes or crashes.
chrome_loop(){
  local PROFILE="$HOME/.ztv-chrome" n=0 code
  mkdir -p "$PROFILE"
  while true; do
    rm -f "$PROFILE"/Singleton*; touch "$XDG_RUNTIME_DIR/chrome.start"
    google-chrome --kiosk --start-fullscreen --window-position=0,0 --window-size="$W,$H" \
      --user-data-dir="$PROFILE" --no-first-run --no-default-browser-check --password-store=basic \
      --noerrdialogs --disable-infobars --disable-session-crashed-bubble --disable-features=Translate,MediaRouter \
      --autoplay-policy=no-user-gesture-required \
      --disable-gpu --disable-dev-shm-usage \
      --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows \
      "$PAGE" >/dev/null 2>&1
    code=$?; n=$((n+1)); log "Chrome closed (exit $code), reopening (restart #$n)"
    sleep 2
  done
}
chrome_loop &
sleep 10
xdotool mousemove "$W" "$H" 2>/dev/null || true

# 4. send it to Kick. If the connection drops, reconnect right away.
#    Ubuntu's ffmpeg makes secure (rtmps) connections with GnuTLS, which Kick tends to cut off every few minutes.
#    So stunnel (OpenSSL) handles the secure part, and ffmpeg sends plain rtmp to it on this machine.
#    Set USE_STUNNEL=no in /etc/ztv/stream.env to send straight from ffmpeg instead.
OUT="${KICK_URL%/}/${KICK_KEY}"; TCURL=""
if [ "${USE_STUNNEL:-yes}" != "no" ] && [[ "$KICK_URL" == rtmps://* ]] && command -v stunnel >/dev/null; then
  u=${KICK_URL#rtmps://}; hp=${u%%/*}; app=${u#*/}; app=${app%/}
  host=${hp%%:*}; port=443; [[ "$hp" == *:* ]] && port=${hp##*:}
  LPORT=${STUNNEL_PORT:-19350}
  cat >"$XDG_RUNTIME_DIR/stunnel.conf" <<CONF
foreground = yes
pid =
debug = ${STUNNEL_DEBUG:-3}
[kick]
client = yes
accept = 127.0.0.1:${LPORT}
connect = ${host}:${port}
sni = ${host}
verifyChain = ${STUNNEL_VERIFY:-yes}
checkHost = ${host}
CAfile = ${STUNNEL_CA:-/etc/ssl/certs/ca-certificates.crt}
TIMEOUTidle = 60
CONF
  stunnel_loop(){ while true; do stunnel "$XDG_RUNTIME_DIR/stunnel.conf" 2>&1 | grep -v -e "^$" ; log "stunnel stopped, restarting"; sleep 2; done; }
  stunnel_loop &
  sleep 1
  OUT="rtmp://127.0.0.1:${LPORT}/${app}/${KICK_KEY}"; TCURL="rtmps://${hp}/${app}"
  log "secure connection to ${host}:${port} handled by stunnel"
fi

ffmpeg_loop(){
  local n=0 code t0
  while true; do
    log "streaming ${W}x${H}@${FPS} ${VB}kbps to Kick"; t0=$SECONDS
    ffmpeg -hide_banner -loglevel error -nostdin -stats_period 5 -progress "$XDG_RUNTIME_DIR/progress" \
      -thread_queue_size 64 -f x11grab -draw_mouse 0 -framerate "$FPS" -video_size "${W}x${H}" -i :99.0 \
      -thread_queue_size 1024 -f pulse -fragment_size 7680 -i ztv.monitor \
      -af aresample=async=1000 \
      -vf "setpts=N/(${FPS}*TB)" \
      -c:v libx264 -preset veryfast -tune zerolatency -pix_fmt yuv420p -r "$FPS" -fps_mode cfr \
      -b:v "${VB}k" -minrate "${VB}k" -maxrate "${VB}k" -bufsize "${VB}k" -x264-params nal-hrd=cbr:force-cfr=1 \
      -g "$((FPS*2))" -keyint_min "$((FPS*2))" -sc_threshold 0 -force_key_frames "expr:gte(t,n_forced*2)" \
      -c:a aac -b:a "${AB}k" -ar 48000 -ac 2 \
      ${TCURL:+-rtmp_tcurl "$TCURL"} -flvflags no_duration_filesize \
      -f flv "$OUT"
    code=$?
    n=$((n+1)); log "connection to Kick stopped (ffmpeg exit $code), reconnecting (restart #$n)"
    # quick failures in a row usually mean Kick is refusing the URL/key: back off instead of hammering
    if (( SECONDS - t0 < 20 )); then sleep 10; else sleep 1; fi
  done
}
ffmpeg_loop &

# 5. keep an eye on things. The page pings the web server every 10s (logged to HB_FILE). If the pings stop for
#    90s, the page has frozen or crashed even though Chrome is still open, so close Chrome and it reopens.
#    If the screen or sound card dies, exit so systemd restarts everything.
HB_FILE=${HB_FILE:-/var/log/nginx/ztv-hb.log}
TICK=0
while true; do
  sleep 15; TICK=$((TICK+1))
  # once a minute, log how the encoder is keeping up: speed should be 1.00x and fps 30
  if (( TICK % 4 == 0 )) && [ -s "$XDG_RUNTIME_DIR/progress" ]; then
    tail -n 14 "$XDG_RUNTIME_DIR/progress" | awk -F= '{v[$1]=$2} END{printf "ZTV: health fps=%s speed=%s dropped=%s duplicated=%s bitrate=%s\n",v["fps"],v["speed"],v["drop_frames"],v["dup_frames"],v["bitrate"]}'
    : >"$XDG_RUNTIME_DIR/progress"
  fi
  if [ -e "$HB_FILE" ] && [ -e "$XDG_RUNTIME_DIR/chrome.start" ]; then
    now=$(date +%s); hb=$(stat -c %Y "$HB_FILE"); cs=$(stat -c %Y "$XDG_RUNTIME_DIR/chrome.start")
    if (( now - hb > 90 && now - cs > 120 )); then
      log "page stopped responding, reopening Chrome"
      pkill -u "$(id -u)" -f "user-data-dir=$HOME/.ztv-chrome" 2>/dev/null; sleep 5
      pkill -KILL -u "$(id -u)" -f "user-data-dir=$HOME/.ztv-chrome" 2>/dev/null   # force it if it's truly stuck
      touch "$XDG_RUNTIME_DIR/chrome.start"
    fi
  fi
  kill -0 "$XVFB" 2>/dev/null || { log "virtual screen stopped, full restart"; exit 1; }
  pactl info >/dev/null 2>&1 || { log "sound stopped, full restart"; exit 1; }
done
