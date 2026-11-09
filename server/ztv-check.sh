#!/usr/bin/env bash
# ZTV speed check: tests the screen grab, the audio and the encoder separately (about 40 seconds).
# Run on the server while the stream is live:  bash ztv-check.sh
U=${ZTV_USER:-ztv}; RUN=${ZTV_RUN:-/run/ztv}
[ -S "$RUN/pulse/native" ] || { echo "The stream doesn't seem to be running (no sound server at $RUN). Start it first: systemctl start ztv-stream"; exit 1; }
t(){ # $1 = label, rest = ffmpeg input args
  local label=$1; shift
  local out; out=$(sudo -u "$U" env DISPLAY=:99 XDG_RUNTIME_DIR="$RUN" PULSE_SERVER="unix:$RUN/pulse/native" \
    ffmpeg -hide_banner -nostdin "$@" -t 12 -f null - 2>&1 | tr '\r' '\n' | grep -E "speed=" | tail -1)
  local fps spd; fps=$(echo "$out" | grep -oE "fps=[ 0-9.]+" | tr -d ' '); spd=$(echo "$out" | grep -oE "speed=[ 0-9.]+x" | tr -d ' ')
  printf "%-24s %-10s %s\n" "$label" "${fps:-}" "${spd:-no result}"
}
echo "Testing... (about 40 seconds)"
t "screen grab:" -f x11grab -framerate 30 -video_size 1280x720 -i :99
t "audio:"       -f pulse -i ztv.monitor
t "encoder:"     -f lavfi -i testsrc2=size=1280x720:rate=30 -c:v libx264 -preset veryfast -tune zerolatency -pix_fmt yuv420p
t "full stream, not sent:" -thread_queue_size 64 -f x11grab -draw_mouse 0 -framerate 30 -video_size 1280x720 -i :99 \
  -thread_queue_size 1024 -f pulse -fragment_size 7680 -i ztv.monitor -af aresample=async=1000 \
  -c:v libx264 -preset veryfast -tune zerolatency -pix_fmt yuv420p -r 30 -fps_mode cfr -b:v 2500k -minrate 2500k -maxrate 2500k -bufsize 2500k \
  -x264-params nal-hrd=cbr:force-cfr=1 -g 60 -c:a aac -b:a 160k -ar 48000 -ac 2
echo
echo "Healthy: screen grab fps=30 speed=1x, audio speed=1x, encoder above 1x, full stream fps=30 speed=1x."
echo "If everything here is healthy but the live stream's health line shows speed under 1x, the upload to Kick is the slow part."
