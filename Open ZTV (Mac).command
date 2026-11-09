#!/bin/bash
# Opens ZTV in its own Chrome window with sound on from the start (works even if Chrome is already open).
cd "$(dirname "$0")"
open -na "Google Chrome" --args --user-data-dir="$HOME/Library/Application Support/ZTV-Chrome" \
  --autoplay-policy=no-user-gesture-required --no-first-run --no-default-browser-check \
  --start-fullscreen --app="file://$PWD/index.html"
