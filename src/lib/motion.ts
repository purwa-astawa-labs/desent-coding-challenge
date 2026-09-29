"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

// Register once; every GSAP consumer imports gsap/useGSAP from here.
gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };

/** Media query under which choreography runs; under reduced motion nothing animates. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/** Count-up duration in seconds. */
export const COUNT_UP_DURATION = 0.3;

/**
 * Tween `target.value` from `from` to `to` in integer steps, reporting each step. The last
 * reported value is always exactly `to` (set in onComplete, not left to snapping).
 * Starting a new count-up on the same target replaces the running one.
 */
export function countUp(
  target: { value: number },
  from: number,
  to: number,
  onUpdate: (value: number) => void,
): gsap.core.Tween {
  target.value = from;
  return gsap.to(target, {
    value: to,
    duration: COUNT_UP_DURATION,
    ease: "power2.out",
    snap: { value: 1 },
    overwrite: true,
    onUpdate: () => onUpdate(target.value),
    onComplete: () => {
      target.value = to;
      onUpdate(to);
    },
  });
}
