import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { normalizeRegionIds, selectEligibleWinnerIds } from "../routes/winners.route";

describe("draw selection helpers", () => {
  test("normalizes multiple region ids from array or comma string", () => {
    assert.deepEqual(normalizeRegionIds(["region-a", "region-b", "region-b"]), [
      "region-a",
      "region-b",
    ]);
    assert.deepEqual(normalizeRegionIds("region-a,region-b"), ["region-a", "region-b"]);
  });

  test("uses round-based distribution across selected regions", () => {
    const participants = [
      { id: "p-a-1", regionId: "region-a", isEligible: true },
      { id: "p-a-2", regionId: "region-a", isEligible: true },
      { id: "p-b-1", regionId: "region-b", isEligible: true },
      { id: "p-b-2", regionId: "region-b", isEligible: true },
      { id: "p-c-1", regionId: "region-c", isEligible: true },
      { id: "p-c-2", regionId: "region-c", isEligible: true },
    ];

    const ids = selectEligibleWinnerIds({
      participants,
      numberOfWinners: 3,
      regionIds: ["region-a", "region-b", "region-c"],
      rng: () => 0,
    });

    assert.equal(ids.length, 3);
    assert.ok(ids.includes("p-a-1"));
    assert.ok(ids.includes("p-b-1"));
    assert.ok(ids.includes("p-c-1"));
  });

  test("avoids duplicate selections within a single draw", () => {
    const participants = [
      { id: "p-a-1", regionId: "region-a", isEligible: true },
      { id: "p-a-2", regionId: "region-a", isEligible: true },
      { id: "p-b-1", regionId: "region-b", isEligible: true },
    ];

    const ids = selectEligibleWinnerIds({
      participants,
      numberOfWinners: 2,
      regionIds: ["region-a", "region-b"],
      rng: () => 0,
    });

    assert.equal(new Set(ids).size, ids.length);
  });

  test("rejects requests larger than available eligible participants", () => {
    const participants = [
      { id: "p-a-1", regionId: "region-a", isEligible: true },
      { id: "p-b-1", regionId: "region-b", isEligible: false },
    ];

    assert.throws(
      () =>
        selectEligibleWinnerIds({
          participants,
          numberOfWinners: 2,
          regionIds: ["region-a", "region-b"],
          rng: () => 0,
        }),
      /exceed available eligible participants/i,
    );
  });
});
