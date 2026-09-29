import { describe, expect, it } from "vitest";
import { COUNT_UP_DURATION, countUp } from "./motion";

describe("countUp", () => {
  it("ends on exactly the target value", () => {
    const target = { value: 0 };
    const seen: number[] = [];
    const tween = countUp(target, 99, 125, (v) => seen.push(v));
    tween.progress(1);
    expect(target.value).toBe(125);
    expect(seen.at(-1)).toBe(125);
  });

  it("steps through integers only", () => {
    const target = { value: 0 };
    const seen: number[] = [];
    const tween = countUp(target, 99, 125, (v) => seen.push(v));
    for (let p = 0.1; p < 1; p += 0.1) tween.progress(p);
    tween.progress(1);
    expect(seen.length).toBeGreaterThan(2);
    for (const v of seen) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(99);
      expect(v).toBeLessThanOrEqual(125);
    }
  });

  it("counts down as well as up", () => {
    const target = { value: 0 };
    let last = NaN;
    countUp(target, 250, 40, (v) => (last = v)).progress(1);
    expect(last).toBe(40);
  });

  it("ends exact even when the target is not an integer", () => {
    const target = { value: 0 };
    let last = NaN;
    countUp(target, 10, 12.5, (v) => (last = v)).progress(1);
    expect(last).toBe(12.5);
  });

  it("lasts at most 300 ms", () => {
    const tween = countUp({ value: 0 }, 0, 10, () => {});
    expect(tween.duration()).toBe(COUNT_UP_DURATION);
    expect(COUNT_UP_DURATION).toBeLessThanOrEqual(0.3);
    tween.kill();
  });
});
