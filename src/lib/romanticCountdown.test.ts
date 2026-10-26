import { test } from "node:test";
import assert from "node:assert/strict";
import { ROMANTIC_TARGET_DATE, romanticCountdown } from "./romanticCountdown";

test("official romantic target is November 4, 2027 at midnight India time", () => {
  assert.equal(ROMANTIC_TARGET_DATE, "2027-11-04T00:00:00+05:30");
  assert.deepEqual(romanticCountdown(Date.parse("2027-11-02T22:57:56+05:30")), [1, 1, 2, 4]);
});
test("the countdown stops at zero on and after the target", () => {
  assert.deepEqual(romanticCountdown(Date.parse("2027-11-04T00:00:00+05:30")), [0, 0, 0, 0]);
  assert.deepEqual(romanticCountdown(Date.parse("2027-11-05T00:00:00+05:30")), [0, 0, 0, 0]);
});
