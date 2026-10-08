#!/usr/bin/env bash
# レンダリング結果の音量を整える（2パス loudnorm：-16 LUFS / True Peak -1.5 dBTP）。映像は yuv420p（TV レンジ）の H.264 に変換
# 使い方: tools/finalize.sh out/raw_main.mp4 out/watakyu_main.mp4
set -euo pipefail
IN=$1; OUT=$2
J=$(ffmpeg -hide_banner -nostats -i "$IN" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -hide_banner -loglevel error -y -i "$IN" -vf "scale=in_range=full:out_range=tv,format=yuv420p" -c:v libx264 -preset slow -crf 18 -profile:v high -tune animation \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 192k -movflags +faststart "$OUT"
echo "normalization: $(ffmpeg -hide_banner -nostats -i "$IN" -af loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true:print_format=json -f null - 2>&1 | grep normalization_type)"
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true:framelog=quiet -f null - 2>&1 | grep -E "^\s+(I|LRA|Peak):"
