import assert from "node:assert/strict";
import {
  dogTeamSignature,
  scoringFieldsChanged,
  scoringSiblingIdentities,
} from "./result-points-invalidation";

const BALOO = { name: "Baloo", NZFSSRegistration: "NZ-BALOO" };
const CLYDE = { name: "Clyde", NZFSSRegistration: "NZ-CLYDE" };
const AKELE = { name: "Akele of Kumiak", NZFSSRegistration: "NZ-AKELE" };
const SLIM = { name: "Alaska Slim", NZFSSRegistration: "NZ-SLIM" };

function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
  } catch (err) {
    console.error(`  FAIL  ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log("\n=== Result points invalidation ===\n");

check("swapping a dog is a scoring change (Clyde replacing Baloo)", () => {
  assert.equal(
    scoringFieldsChanged(
      { associatedDog: [BALOO] },
      { associatedDog: [CLYDE] }
    ),
    true
  );
});

check("same dog team in a different order is not a scoring change", () => {
  assert.equal(
    scoringFieldsChanged(
      { associatedDog: [AKELE, SLIM] },
      { associatedDog: [SLIM, AKELE] }
    ),
    false
  );
});

check("dropping a dog from heat 2 is a scoring change", () => {
  assert.equal(
    scoringFieldsChanged(
      { associatedDog: [AKELE, SLIM], heat: "Heat 2" },
      { associatedDog: [AKELE], heat: "Heat 2" }
    ),
    true
  );
});

check("replacing Slim with Clyde on heat 2 is a scoring change", () => {
  assert.equal(
    scoringFieldsChanged(
      { associatedDog: [AKELE, SLIM], heat: "Heat 2" },
      { associatedDog: [AKELE, CLYDE], heat: "Heat 2" }
    ),
    true
  );
});

check("temperature-only edits do not invalidate points", () => {
  assert.equal(
    scoringFieldsChanged(
      { associatedDog: [BALOO], raceTime: "00:10:00.00" },
      {}
    ),
    false
  );
});

check("time or DNF changes invalidate points", () => {
  assert.equal(
    scoringFieldsChanged(
      { raceTime: "00:10:00.00", raceType: "started" },
      { raceTime: "00:11:00.00" }
    ),
    true
  );
  assert.equal(
    scoringFieldsChanged(
      { raceType: "started" },
      { raceType: "did not finish" }
    ),
    true
  );
});

check("dogTeamSignature ignores listing order", () => {
  assert.equal(dogTeamSignature([AKELE, SLIM]), dogTeamSignature([SLIM, AKELE]));
  assert.notEqual(dogTeamSignature([AKELE, SLIM]), dogTeamSignature([AKELE, CLYDE]));
});

check("heat siblings share one identity so Heat 1 points are cleared too", () => {
  const identities = scoringSiblingIdentities({
    name: "Eric Altermann",
    class: "speed",
    customClass: "2-dog rig",
  });
  assert.equal(identities.length, 1);
  assert.equal(identities[0].name, "Eric Altermann");
  assert.equal(identities[0].customClass, "2-dog rig");
});

check("a class move invalidates both the old and new class", () => {
  const identities = scoringSiblingIdentities(
    { name: "Eric", class: "speed", customClass: "2-dog" },
    { customClass: "4-dog" }
  );
  assert.equal(identities.length, 2);
  assert.deepEqual(
    identities.map((i) => i.customClass).sort(),
    ["2-dog", "4-dog"]
  );
});

if (process.exitCode) {
  console.log("\n=== Result points invalidation: FAILED ===\n");
  process.exit(1);
}

console.log("\n=== Result points invalidation: all passed ===\n");
