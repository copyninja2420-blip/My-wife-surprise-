import { test } from "node:test";
import { strictEqual } from "node:assert";
import { gatewayUrl } from "./secretGateway";

test("QR target preserves the current live URL including query and fragment", () => {
  strictEqual(
    gatewayUrl({ href: "https://our-story.example/?gift=birthday#memories" }),
    "https://our-story.example/?gift=birthday#memories",
  );
});
