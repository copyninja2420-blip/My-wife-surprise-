import { test } from "node:test";
import { strictEqual } from "node:assert";
import { canEnterStory, nextCakePhase } from "./birthdayCake";

test("story stays locked until candle is blown out", () => {
  strictEqual(canEnterStory("lit"), false);
  strictEqual(canEnterStory(nextCakePhase("lit", "blow")), false);
});
test("cake must be cut before continuing to the avatar", () => {
  strictEqual(canEnterStory("blown"), false);
  strictEqual(nextCakePhase("lit", "cut"), "lit");
  strictEqual(nextCakePhase("blown", "cut"), "cut");
  strictEqual(canEnterStory("cut"), true);
});
