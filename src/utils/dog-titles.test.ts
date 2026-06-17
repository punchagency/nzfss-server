import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  determineTitle,
  titleRank,
  achievedTitlesUpTo,
  highestRecognisedTitle,
  isUnrecognisedTitleChange,
  positionCreditsFor,
} from "./dog-titles";
import {
  aggregateDogPoints,
  extractPetName,
  getDogMergeKey,
  type AggPoint,
  type AggRcrPoint,
} from "./dog-points-aggregation";
import { buildKeyResolver } from "../service/dog-title.service";

describe("determineTitle (mirrors client thresholds)", () => {
  it("returns null below all thresholds", () => {
    assert.equal(
      determineTitle({ pointsWithinCutoff: 10, totalPoints: 30, positionCredits: 0 }),
      null
    );
  });

  it("SD at 45 total points", () => {
    assert.equal(
      determineTitle({ pointsWithinCutoff: 0, totalPoints: 45, positionCredits: 0 }),
      "SD"
    );
  });

  it("SDX at 90 within-cutoff points", () => {
    assert.equal(
      determineTitle({ pointsWithinCutoff: 90, totalPoints: 90, positionCredits: 0 }),
      "SDX"
    );
  });

  it("does NOT award SDCh without enough position credits", () => {
    assert.equal(
      determineTitle({ pointsWithinCutoff: 200, totalPoints: 200, positionCredits: 8 }),
      "SDX"
    );
  });

  it("SDCh at 180 points AND 16 position credits", () => {
    assert.equal(
      determineTitle({ pointsWithinCutoff: 180, totalPoints: 180, positionCredits: 16 }),
      "SDCh"
    );
  });

  it("position credits: 1st=4, 2nd=2, 3rd=1", () => {
    assert.equal(positionCreditsFor({ first: 4, second: 0, third: 0 }), 16);
    assert.equal(positionCreditsFor({ first: 0, second: 8, third: 0 }), 16);
    assert.equal(positionCreditsFor({ first: 0, second: 0, third: 16 }), 16);
  });
});

describe("title ranking + recognition rules", () => {
  it("ranks SD < SDX < SDCh", () => {
    assert.ok(titleRank("SD") < titleRank("SDX"));
    assert.ok(titleRank("SDX") < titleRank("SDCh"));
    assert.equal(titleRank(null), -1);
  });

  it("achievedTitlesUpTo cascades downward", () => {
    assert.deepEqual(achievedTitlesUpTo("SDCh"), { SD: true, SDX: true, SDCh: true });
    assert.deepEqual(achievedTitlesUpTo("SDX"), { SD: true, SDX: true, SDCh: false });
    assert.deepEqual(achievedTitlesUpTo(null), { SD: false, SDX: false, SDCh: false });
  });

  it("highestRecognisedTitle returns the top set flag", () => {
    assert.equal(highestRecognisedTitle({ sd: true, sdx: true, sdCh: false }), "SDX");
    assert.equal(highestRecognisedTitle({ sd: false, sdx: false, sdCh: false }), null);
    assert.equal(highestRecognisedTitle(undefined), null);
  });

  it("excludes dogs with no earned title", () => {
    assert.equal(isUnrecognisedTitleChange(null, { sd: false, sdx: false, sdCh: false }), false);
  });

  it("excludes when highest earned title already recognised", () => {
    assert.equal(isUnrecognisedTitleChange("SDX", { sd: true, sdx: true, sdCh: false }), false);
  });

  it("includes when highest earned title not yet recognised", () => {
    assert.equal(isUnrecognisedTitleChange("SDX", { sd: true, sdx: false, sdCh: false }), true);
    assert.equal(isUnrecognisedTitleChange("SD", { sd: false, sdx: false, sdCh: false }), true);
  });
});

describe("pet name extraction + merge keys", () => {
  it("extracts pet name from pedigree-style names", () => {
    assert.equal(extractPetName("Nalbec's Finn"), "finn");
    assert.equal(extractPetName("Howling Spirits Rita at Nalbec"), "rita");
    assert.equal(extractPetName("Akela of Kumiak", "RR/098/AKELA"), "akela");
    assert.equal(extractPetName("Akela of Kumiak", "RR/098"), "akela");
    assert.equal(extractPetName("Natomah Skoahls Amos", "RR/098"), "amos");
  });

  it("merges AMOS and AKELA historical + live via reg key", () => {
    assert.equal(
      getDogMergeKey({ name: "Natomah Skoahls Amos", registration: "RR/098" }),
      getDogMergeKey({ name: "AMOS", registration: "RR/098/AMOS" })
    );
    assert.equal(
      getDogMergeKey({ name: "Akela of Kumiak", registration: "RR/098" }),
      getDogMergeKey({ name: "AKELA", registration: "RR/098" })
    );
  });

  it("prefers dogId for merge key, falls back to reg+name", () => {
    assert.equal(getDogMergeKey({ dogId: "ABC" }), "id:abc");
    assert.equal(
      getDogMergeKey({ name: "Nalbec's Finn", registration: "RR/098" }),
      "reg:rr/098|finn"
    );
  });
});

describe("aggregateDogPoints", () => {
  it("merges live FINN and historical Nalbec's Finn into one dog", () => {
    const points: AggPoint[] = [
      {
        points: 50,
        cutoffTime: "00:30:00",
        dogPoints: [{ NZFSSRegistration: "RR/098", points: 50 }],
        entrant: {
          raceTime: "00:20:00",
          class: "Open",
          customClass: "",
          eventId: "evt1",
          raceType: "speed",
          associatedDog: [{ name: "FINN", NZFSSRegistration: "RR/098/FINN" }],
        },
      },
    ];
    const rcr: AggRcrPoint[] = [
      { rcrReg: "RR/098", rcrPedigreeName: "Nalbec's Finn", rcrPoints: 264.5, rcrEvents: 9 },
    ];

    const result = aggregateDogPoints(points, rcr);
    // Both records share reg:rr/098|finn
    assert.equal(result.size, 1);
    const agg = result.get("reg:rr/098|finn");
    assert.ok(agg);
    assert.equal(agg!.events, 10);
    assert.equal(agg!.pointsWithinCutoff, 314.5);
  });

  it("does not collapse RCR rows that share a bad kennel-level dogId", () => {
    const sharedDogId = "11111111-1111-4111-8111-111111111111";
    const rcr: AggRcrPoint[] = [
      {
        dogId: sharedDogId,
        rcrReg: "RR/098",
        rcrPedigreeName: "Nalbec's Finn",
        rcrPoints: 264.5,
        rcrEvents: 9,
      },
      {
        dogId: sharedDogId,
        rcrReg: "RR/098",
        rcrPedigreeName: "Nalbec's Willow",
        rcrPoints: 185,
        rcrEvents: 0,
      },
      {
        dogId: sharedDogId,
        rcrReg: "RR/098",
        rcrPedigreeName: "Akela of Kumiak",
        rcrPoints: 677.5,
        rcrEvents: 8,
      },
    ];

    const result = aggregateDogPoints([], rcr);
    assert.equal(result.size, 3);
    assert.ok(result.get("reg:rr/098|finn"));
    assert.ok(result.get("reg:rr/098|willow"));
    assert.ok(result.get("reg:rr/098|akela"));
  });

  it("merges Akela RCR and live when live rows share a bad kennel dogId", () => {
    const sharedDogId = "47ac99c1-784c-4cf3-a745-8bb9bd2586b9";
    const akelaDogId = "870aef1d-c278-4719-bc29-0e5ca3536fce";
    const registry = [
      {
        musherId: "m1",
        ownerName: "Eric",
        dogId: akelaDogId,
        name: "AKELA",
        pedigreeName: "Akela of Kumiak",
        nzfssNo: "RR/098",
        breed: "Siberian",
        flags: { sd: false, sdx: false, sdCh: false },
      },
    ];
    const points: AggPoint[] = [
      {
        points: 74.5,
        cutoffTime: "00:30:00",
        dogPoints: [{ NZFSSRegistration: "RR/098", points: 74.5 }],
        entrant: {
          raceTime: "00:20:00",
          class: "Open",
          customClass: "",
          eventId: "evt1",
          raceType: "speed",
          associatedDog: [
            {
              dogId: sharedDogId,
              name: "Akela of Kumiak",
              NZFSSRegistration: "RR/098",
            },
          ],
        },
      },
    ];
    const rcr: AggRcrPoint[] = [
      {
        dogId: sharedDogId,
        rcrReg: "RR/098",
        rcrPedigreeName: "Akela of Kumiak",
        rcrPoints: 645.5,
        rcrEvents: 0,
        rcrAwards: "SDCh",
      },
    ];

    const { resolveKey } = buildKeyResolver(registry, points, rcr);
    const result = aggregateDogPoints(points, rcr, resolveKey);
    assert.equal(result.size, 1);
    const agg = result.get(`id:${akelaDogId}`);
    assert.ok(agg);
    assert.equal(agg!.pointsWithinCutoff, 720);
    assert.equal(agg!.events, 1);
  });

  it("awards first place to the fastest entrant in a class", () => {
    const points: AggPoint[] = [
      {
        points: 10,
        cutoffTime: "00:30:00",
        dogPoints: [{ NZFSSRegistration: "RR/1/A", points: 10 }],
        entrant: {
          raceTime: "00:15:00",
          class: "Open",
          customClass: "",
          eventId: "evt1",
          raceType: "speed",
          associatedDog: [{ dogId: "dog-a", name: "A", NZFSSRegistration: "RR/1/A" }],
        },
      },
      {
        points: 8,
        cutoffTime: "00:30:00",
        dogPoints: [{ NZFSSRegistration: "RR/2/B", points: 8 }],
        entrant: {
          raceTime: "00:18:00",
          class: "Open",
          customClass: "",
          eventId: "evt1",
          raceType: "speed",
          associatedDog: [{ dogId: "dog-b", name: "B", NZFSSRegistration: "RR/2/B" }],
        },
      },
    ];
    const result = aggregateDogPoints(points, []);
    assert.equal(result.get("id:dog-a")!.positions.first, 1);
    assert.equal(result.get("id:dog-b")!.positions.second, 1);
  });
});
