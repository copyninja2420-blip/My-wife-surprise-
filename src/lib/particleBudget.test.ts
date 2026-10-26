import { test } from "node:test";
import assert from "node:assert/strict";
import { cappedParticleCount } from "./particleBudget";

test("particle pools never exceed 35 active elements", () => {
  assert.equal(cappedParticleCount(84), 35);
  assert.equal(cappedParticleCount(35), 35);
  assert.equal(cappedParticleCount(18), 18);
});
