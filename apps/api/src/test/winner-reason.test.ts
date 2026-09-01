import assert from "node:assert/strict";
import test from "node:test";
import { winnerSchema } from "@raffle_v2/shared";

test("winner schema includes a nullable reason field for deletion and redraw actions", () => {
  assert.ok("reason" in winnerSchema.shape, "winnerSchema should expose a reason field");

  const validWinner = winnerSchema.parse({
    id: "123e4567-e89b-12d3-a456-426614174000",
    person: {
      id: "123e4567-e89b-12d3-a456-426614174001",
      employeeId: "EMP-001",
      fullname: "Juan Dela Cruz",
      image: "https://example.com/juan.png",
      region: {
        id: "123e4567-e89b-12d3-a456-426614174002",
        region: "NCR",
        regionName: "National Capital Region",
      },
      isEligible: true,
      schoolsDivision: "Division A",
      station: "Station 1",
      designation: "Teacher III",
      email: "juan@example.com",
    },
    prize: {
      id: "123e4567-e89b-12d3-a456-426614174003",
      prize: "Laptop",
      sponsor: "ABC Corp",
      type: "MAJOR PRIZE",
      numberOfWinners: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    },
    isReceived: false,
    receivedAt: null,
    createdAt: new Date().toISOString(),
    reason: null,
  });

  assert.equal(validWinner.reason, null);

  const invalidatedWinner = winnerSchema.parse({
    ...validWinner,
    reason: "Winner was not eligible for the prize.",
  });

  assert.equal(invalidatedWinner.reason, "Winner was not eligible for the prize.");
});
