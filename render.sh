#!/bin/sh
# Render without a GPU: Chrome on Mesa's llvmpipe, under a virtual display. Arguments go straight to render.mjs.
#   ./render.sh --sheet=1,2,3 --out=out/check/a.jpg      ./render.sh --frames      ./render.sh --encode --out=out/video.mp4
[ -n "$CHROME_PATH" ] || CHROME_PATH=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux64/chrome 2>/dev/null | tail -1)
export CHROME_PATH
case " $* " in *" --encode "*) exec node render.mjs "$@" ;; esac
exec xvfb-run -a -s "-screen 0 1920x1080x24" node render.mjs --llvmpipe "$@"
