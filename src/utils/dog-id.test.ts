import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateDogId,
  isValidDogId,
  resolveDogId,
  buildDogLookup,
  findExistingDog,
  assertUniqueDogIds,
} from "./dog-id";
import {
  processDogsForCreate,
  processDogsForUpdate,
} from "./process-musher-dogs";

describe("dog-id utilities", () => {
  it("generates valid UUID v4 dogIds", () => {
    const id = generateDogId();
    assert.ok(isValidDogId(id));
  });

  it("resolveDogId preserves existing dogId and never changes it", () => {
    const existingId = "a1b2c3d4-e5f6-4789-a012-3456789abcde";
    const resolved = resolveDogId(
      { dogId: existingId },
      { dogId: existingId }
    );
    assert.equal(resolved, existingId);
  });

  it("resolveDogId accepts _id alias", () => {
    const id = generateDogId();
    assert.equal(resolveDogId({ _id: id }), id);
  });

  it("assertUniqueDogIds throws on duplicates", () => {
    const id = generateDogId();
    assert.throws(() =>
      assertUniqueDogIds([{ dogId: id }, { dogId: id }], "test")
    );
  });
});

describe("process-musher-dogs", () => {
  it("assigns unique dogIds on create", () => {
    const dogs = processDogsForCreate([
      { name: "Max", pedigreeName: "Alpha Max" },
      { name: "Luna", pedigreeName: "Beta Luna" },
    ]);
    assert.equal(dogs.length, 2);
    assert.ok(isValidDogId(dogs[0].dogId));
    assert.ok(isValidDogId(dogs[1].dogId));
    assert.notEqual(dogs[0].dogId, dogs[1].dogId);
  });

  it("preserves dogId when pedigree name changes on update", () => {
    const existingId = generateDogId();
    const existing = [
      {
        dogId: existingId,
        name: "Max",
        nzfssNo: "NZ-001",
        pedigreeName: "Old Pedigree",
      },
    ];

    const updated = processDogsForUpdate(
      [
        {
          dogId: existingId,
          name: "Max",
          nzfssNo: "NZ-001",
          pedigreeName: "New Pedigree Name",
        },
      ],
      existing
    );

    assert.equal(updated.length, 1);
    assert.equal(updated[0].dogId, existingId);
    assert.equal(updated[0].pedigreeName, "New Pedigree Name");
  });

  it("matches existing dog by nzfssNo when dogId omitted", () => {
    const existingId = generateDogId();
    const updated = processDogsForUpdate(
      [{ name: "Max", nzfssNo: "NZ-002", pedigreeName: "Renamed" }],
      [{ dogId: existingId, name: "Max", nzfssNo: "NZ-002", pedigreeName: "Original" }]
    );
    assert.equal(updated[0].dogId, existingId);
  });

  it("findExistingDog does not match by pedigree name alone", () => {
    const lookup = buildDogLookup([
      { dogId: generateDogId(), name: "Max", pedigreeName: "Old Name" },
    ]);
    const found = findExistingDog(
      { name: "Different Pet" },
      lookup
    );
    assert.equal(found, undefined);
  });
});
