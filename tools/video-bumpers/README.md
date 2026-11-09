# Video bumpers

The pixel-art bumpers in `bumpers/` are drawn by these scripts, so they can be changed or added to.

- `px.py`: the toolkit (a 320x180 canvas, a 5x7 pixel font, and the CRT upscale to 1280x720)
- `bumps.py`: one function per bumper that draws a frame for time `t`
- `render.py`: draws every frame, makes the sound, and writes `bumpers/<name>.mp4`

Needs Python 3 with numpy, plus ffmpeg. From the project folder:

    python3 tools/video-bumpers/render.py bumpers              # all of them
    python3 tools/video-bumpers/render.py bumpers night-drive  # just one

Then list the file in `data/bumpers.js`.
