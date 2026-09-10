/**
 * Tests for planning a single-dog move between mushers.
 * Run: npx ts-node --transpile-only src/utils/dog-transfer.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { planDogTransfer, findDogInList, type TransferDog } from "./dog-transfer";

const AKELA: TransferDog = {
  dogId: "a1b2c3d4-e5f6-4789-a012-3456789abcde",
  name: "Akela of Kumiak",
  nzfssNo: "RR/098",
  breed: "Siberian Husky",
};
const SLIM: TransferDog = {
  dogId: "b2c3d4e5-f6a7-4890-b123-456789abcdef",
  name: "Alaska Slim",
  nzfssNo: "RR/099",
  breed: "Siberian Husky",
};
const CLYDE: TransferDog = {
  dogId: "c3d4e5f6-a7b8-4901-c234-56789abcdef0",
  name: "Clyde",
  nzfssNo: "RR/100",
  breed: "Malamute",
};

describe("planDogTransfer", () => {
  it("moves a dog off the source and onto the destination", () => {
    const plan = planDogTransfer([AKELA, SLIM], [CLYDE], { dogId: AKELA.dogId });
    assert.deepEqual(plan.sourceDogs.map((d) => d.dogId), [SLIM.dogId]);
    assert.deepEqual(
      plan.destinationDogs.map((d) => d.dogId),
      [CLYDE.dogId, AKELA.dogId]
    );
    assert.equal(plan.movedDog.dogId, AKELA.dogId);
  });

  it("preserves the dog's registration and identity across the move", () => {
    const plan = planDogTransfer([AKELA], [], { dogId: AKELA.dogId });
    assert.equal(plan.destinationDogs[0].nzfssNo, "RR/098");
    assert.equal(plan.destinationDogs[0].dogId, AKELA.dogId);
  });

  it("selects by registration number when no dogId is given", () => {
    const plan = planDogTransfer([AKELA, SLIM], [], { nzfssNo: "RR/099" });
    assert.equal(plan.movedDog.dogId, SLIM.dogId);
    assert.deepEqual(plan.sourceDogs.map((d) => d.dogId), [AKELA.dogId]);
  });

  it("does not duplicate a dog already present on the destination", () => {
    // Destination holds a stale copy of Akela (e.g. a legacy record); the move
    // must leave exactly one Akela, the freshly moved subdocument.
    const staleAkela = { ...AKELA, breed: "" };
    const plan = planDogTransfer([AKELA], [staleAkela, CLYDE], { dogId: AKELA.dogId });
    const akelas = plan.destinationDogs.filter((d) => d.dogId === AKELA.dogId);
    assert.equal(akelas.length, 1, "only one copy of the dog on the destination");
    assert.equal(akelas[0].breed, "Siberian Husky", "the moved copy wins");
  });

  it("throws when the dog is not on the source musher", () => {
    assert.throws(() => planDogTransfer([SLIM], [], { dogId: AKELA.dogId }));
  });

  it("leaves the original arrays untouched (no mutation)", () => {
    const source = [AKELA, SLIM];
    const dest = [CLYDE];
    planDogTransfer(source, dest, { dogId: AKELA.dogId });
    assert.equal(source.length, 2, "source array not mutated");
    assert.equal(dest.length, 1, "destination array not mutated");
  });

  it("findDogInList locates by dogId, registration, or name", () => {
    assert.equal(findDogInList([AKELA, SLIM], { dogId: SLIM.dogId })?.dogId, SLIM.dogId);
    assert.equal(findDogInList([AKELA, SLIM], { nzfssNo: "rr/098" })?.dogId, AKELA.dogId);
    assert.equal(findDogInList([AKELA, SLIM], { name: "clyde" }), undefined);
  });
});
