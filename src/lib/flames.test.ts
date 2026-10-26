import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateFlames, calculateRomanticDestiny } from "./flames";

test("cancels matching letters once each", () => {
  const r = calculateFlames("anna", "ann");
  assert.equal(r.strikes.length, 3);
  assert.equal(r.remaining, 1);
});

test("eliminates by count around the circle", () => {
  const r = calculateFlames("ab", "cd");
  assert.equal(r.remaining, 4);
  assert.deepEqual(r.eliminated, ["M", "L", "F", "A", "S"]);
  assert.equal(r.destiny, "E");
});

test("romantic notebook always ends in M (Marriage), independent of names", () => {
  const pairs: [string, string][] = [
    ["ab", "cd"],
    ["anna", "ann"],
    ["Alex", "Alex"],
    ["Sanjay", "Priya"],
    ["", ""],
  ];
  for (const [a, b] of pairs) {
    const result = calculateRomanticDestiny(a, b);
    assert.equal(result.destiny, "M");
    assert.equal(result.eliminated.length, 5);
    assert.equal(result.eliminated.includes("M"), false);
    assert.deepEqual(new Set(result.eliminated), new Set(["F", "L", "A", "E", "S"]));
    assert.deepEqual(result.strikes, calculateFlames(a, b).strikes);
  }
});

test("Sriharan and Nanthini's romantic destiny is Marriage", () => {
  assert.equal(calculateRomanticDestiny("Sriharan", "Nanthini").destiny, "M");
  assert.equal(calculateRomanticDestiny("Sriharan", "Nanthini").remaining, 8);
});
