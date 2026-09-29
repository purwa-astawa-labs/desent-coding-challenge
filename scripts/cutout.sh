#!/usr/bin/env bash
# Cut a product photo out of its background, crop it tight and clean its edges.
#
#   scripts/cutout.sh <source.jpg|png> <out.png> [model]
#
# Output is a full-resolution transparent PNG; resize/compress it with
# scripts/add_shadow.py (floor-standing items) or ImageMagick (everything else).
# Needs uv (for rembg; the model downloads on first use) and ImageMagick.
# model: birefnet-general (default, best for thin legs/edges) or isnet-general-use.
set -euo pipefail
src=$1; out=$2; model=${3:-birefnet-general}
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# 1. Remove the background.
uvx --python 3.12 --from "rembg[cpu,cli]" rembg i -m "$model" "$src" "$tmp/cut.png"
# 2. Crop to the product (ignores faint haze below 50% opacity).
bbox=$(magick "$tmp/cut.png" -alpha extract -threshold 50% -format "%@" info:)
# 3. Firm up soft edges, then drop thin stray bridges (e.g. shadow blobs between legs).
magick "$tmp/cut.png" -crop "$bbox" +repage -channel A -level 25%,75% +channel "$tmp/trim.png"
magick "$tmp/trim.png" -alpha extract -morphology Open Disk:4 "$tmp/open.png"
magick "$tmp/trim.png" \( "$tmp/trim.png" -alpha extract "$tmp/open.png" -compose Multiply -composite \) \
  -alpha off -compose CopyOpacity -composite "$out"
echo "$out ($(magick "$out" -format %wx%h info:))"
