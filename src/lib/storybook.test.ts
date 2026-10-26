import { test } from "node:test";
import assert from "node:assert/strict";
import { journal, playlist } from "../content/loveStory";

test("the private diary opens with passcode 1914", () => {
  assert.equal(journal.passcode, "1914");
});
test("the bundled music playlist stays empty", () => {
  assert.equal(playlist.length, 0);
});
