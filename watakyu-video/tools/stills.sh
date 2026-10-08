#!/usr/bin/env bash
# 確認用の静止画を書き出す: tools/stills.sh <Main|Full> <frame> [frame...]
set -e
cd "$(dirname "$0")/.."
COMP=$1; shift
BUILD=${BUILD_DIR:-.remotion/build}
npx remotion bundle src/index.ts --out-dir="$BUILD" >/dev/null 2>&1
mkdir -p out/stills
for f in "$@"; do
  npx remotion still "$BUILD" "$COMP" "out/stills/${COMP}_$(printf %04d "$f").png" --frame="$f" ${REMOTION_BROWSER:+--browser-executable="$REMOTION_BROWSER"} >/dev/null 2>&1 &
  while [ "$(jobs -r | wc -l)" -ge 4 ]; do sleep 0.5; done
done
wait
ls out/stills
