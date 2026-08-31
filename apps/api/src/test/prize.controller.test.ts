import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { canDeletePrize } from "../guard/prize-delete.guard";

describe("canDeletePrize", () => {
  test("allows deleting a prize without winners", () => {
    assert.equal(canDeletePrize(0), true);
  });

  test("prevents deleting a prize with winners", () => {
    assert.equal(canDeletePrize(1), false);
  });
});
