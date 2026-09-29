"use client";

import { useRef, useState } from "react";
import { MOTION_OK, countUp, gsap, useGSAP } from "@/lib/motion";

/**
 * The number to display for `value`: counts up (or down) to each new value in ~300 ms.
 * Exact on first render, exact at the end of every count, and instant under reduced motion.
 * While `ready` is false (e.g. before the saved selection loads) and on the change that makes it
 * true, the value is shown as is, so a restored total does not count up from zero.
 */
export function useAnimatedNumber(value: number, ready = true): number {
  // null = show `value` itself; a number = an intermediate count-up step.
  const [step, setStep] = useState<number | null>(null);
  // What is on screen right now; the start of the next count.
  const counter = useRef({ value });
  const wasReady = useRef(ready);

  useGSAP(
    () => {
      const from = counter.current.value;
      const canAnimate = wasReady.current && ready;
      wasReady.current = ready;
      if (from === value) return;
      // Probe reduced motion via gsap.matchMedia, then drop it: the tween below belongs to this
      // hook's useGSAP context, so a later media change can't revert it to a stale value.
      let motionOk = false;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        motionOk = true;
      });
      mm.revert();
      if (canAnimate && motionOk) {
        countUp(counter.current, from, value, (v) => setStep(v === value ? null : v));
      } else {
        // Reduced motion (or not ready): jump straight to the exact value.
        gsap.killTweensOf(counter.current);
        counter.current.value = value;
        setStep(null);
      }
    },
    { dependencies: [value, ready] },
  );

  return step ?? value;
}
