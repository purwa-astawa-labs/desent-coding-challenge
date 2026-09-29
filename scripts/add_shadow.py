#!/usr/bin/env python3
"""Bake soft contact shadows under a floor-standing item's feet, castors or tyres.

    python3 scripts/add_shadow.py <cutout.png> <out.webp> <size> <tolerance> [quality]

  size       ImageMagick resize geometry, e.g. 1300x (width) or x1100 (height)
  tolerance  how far above the lowest point still counts as touching the floor,
             as a fraction of the image height: ~0.012 for desks (both feet level),
             ~0.06 for chairs (front castors sit at slightly different depths)

The contact points are found from the transparency mask: columns whose lowest
opaque pixel is within `tolerance` of the bottom, grouped into feet. Each gets a
dark soft shadow at its own depth, plus a faint one under the whole footprint.
Room for the shadow is added below the image, so top-anchored layers don't move;
for bottom-anchored layers the extra rows sit on the anchor line.
Needs ImageMagick (`magick`).
"""
import os
import subprocess
import sys


def main() -> None:
    src, out, size, tol = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
    quality = sys.argv[5] if len(sys.argv) > 5 else "85"
    tmp, raw = out + ".tmp.png", out + ".alpha.raw"
    subprocess.check_call(["magick", src, "-resize", size, tmp])
    w, h = map(int, subprocess.check_output(["magick", tmp, "-format", "%w %h", "info:"]).split())
    subprocess.check_call(["magick", tmp, "-alpha", "extract", "-threshold", "50%", "-depth", "8", f"gray:{raw}"])
    alpha = open(raw, "rb").read()
    bottom = [max((y for y in range(h) if alpha[y * w + x] > 127), default=-1) for x in range(w)]

    cols = [x for x in range(w) if bottom[x] >= h - 1 - tol * h]
    feet: list[list[int]] = []
    for x in cols:
        if feet and x - feet[-1][-1] <= max(3, w // 150):
            feet[-1].append(x)
        else:
            feet.append([x])

    pad, ry = max(10, h // 45), max(3, h // 150)
    draws = [f"fill rgba(0,0,0,0.18) ellipse {(cols[0] + cols[-1]) // 2},{h - 2} {(cols[-1] - cols[0]) // 2 + w // 30},{ry * 2} 0,360"]
    for f in feet:
        rx = max(6, int((f[-1] - f[0]) * 0.8) + w // 80)
        draws.append(f"fill rgba(0,0,0,0.55) ellipse {(f[0] + f[-1]) // 2},{max(bottom[x] for x in f)} {rx},{ry} 0,360")

    cmd = ["magick", tmp, "-gravity", "north", "-background", "none", "-extent", f"{w}x{h + pad}",
           "(", "-size", f"{w}x{h + pad}", "xc:none"]
    for d in draws:
        cmd += ["-draw", d]
    cmd += ["-blur", f"0x{max(3, h // 180)}", ")", "-compose", "DstOver", "-composite",
            "-quality", quality, "-define", "webp:alpha-quality=100", out]
    subprocess.check_call(cmd)
    os.remove(tmp)
    os.remove(raw)
    print(f"{os.path.basename(out)}: {w}x{h + pad}, feet at x {[(f[0], f[-1]) for f in feet]}")


if __name__ == "__main__":
    main()
