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
  findAmbiguousPetNames,
  getDogMergeKey,
  type AggPoint,
  type AggRcrPoint,
  type DogAggregate,
} from "./dog-points-aggregation";
import {
  buildKeyResolver,
  earnedTitleFor,
  parseTitleFromAwards,
  recognisedTitleFor,
} from "../service/dog-title.service";
import { isNonScoringClass } from "./class-eligibility";
import {
  applyCutoffTracking,
  getCutoffPointsForKey,
  parseRcrCutoffPoints,
} from "../service/dog-race-points.service";

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
    assert.equal(isUnrecognisedTitleChange(null, null), false);
  });

  it("excludes when highest earned title already recognised", () => {
    assert.equal(isUnrecognisedTitleChange("SDX", "SDX"), false);
  });

  it("excludes when recognised above the earned title (never show a downgrade)", () => {
    assert.equal(isUnrecognisedTitleChange("SDX", "SDCh"), false);
  });

  it("includes when highest earned title not yet recognised", () => {
    assert.equal(isUnrecognisedTitleChange("SDX", "SD"), true);
    assert.equal(isUnrecognisedTitleChange("SD", null), true);
  });
});

describe("historical RCR awards count as already recognised", () => {
  const agg = (historicalAwards: string, points = 0): DogAggregate => ({
    key: "id:test",
    petName: "test",
    displayName: "Test",
    kennelReg: "TB/003",
    pointsWithinCutoff: points,
    pointsOutsideCutoff: 0,
    events: 1,
    positions: { first: 0, second: 0, third: 0 },
    historicalAwards,
  });

  it("parses award strings into title codes", () => {
    assert.equal(parseTitleFromAwards("SDCh"), "SDCh");
    assert.equal(parseTitleFromAwards("SDX"), "SDX");
    assert.equal(parseTitleFromAwards("SD"), "SD");
    assert.equal(parseTitleFromAwards(""), null);
    assert.equal(parseTitleFromAwards(undefined), null);
  });

  it("treats a historical award as recognised, not as a new change", () => {
    // Wildespitz Rogue SDCH: 810.5 lifetime RCR points, no per-race placings.
    // Earns SDX on points, SDCh only via the award string — so both the earned
    // and the recognised title land on SDCh and the dog is not a change.
    const aggregate = agg("SDCh", 810.5);
    const earned = earnedTitleFor(aggregate);
    const recognised = recognisedTitleFor(undefined, aggregate);

    assert.equal(earned, "SDCh");
    assert.equal(recognised, "SDCh");
    assert.equal(isUnrecognisedTitleChange(earned, recognised), false);
  });

  it("still reports a genuine upgrade above the historical award", () => {
    // RCR records SD; the dog has since raced to SDX on points.
    const aggregate = agg("SD", 90);
    const earned = earnedTitleFor(aggregate);
    const recognised = recognisedTitleFor(undefined, aggregate);

    assert.equal(earned, "SDX");
    assert.equal(recognised, "SD");
    assert.equal(isUnrecognisedTitleChange(earned, recognised), true);
  });

  it("keeps the higher of stored flags and the historical award", () => {
    assert.equal(recognisedTitleFor({ sd: true, sdx: true, sdCh: false }, agg("SD")), "SDX");
    assert.equal(recognisedTitleFor({ sd: true, sdx: false, sdCh: false }, agg("SDCh")), "SDCh");
    assert.equal(recognisedTitleFor(undefined, undefined), null);
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

describe("ambiguous pet names", () => {
  // Kennel-level regs (TB/014, no /SHA suffix) make both names shorten to the
  // kennel word "carob", which used to sum two dogs into one row.
  const carobRows: AggRcrPoint[] = [
    { rcrReg: "TB/014", rcrPedigreeName: "Black Magic of Carob", rcrPoints: 461.5 },
    { rcrReg: "TB/014", rcrPedigreeName: "German Son of Carob", rcrPoints: 526 },
  ];

  it("flags a short name claimed by two pedigree names in one kennel", () => {
    assert.deepEqual([...findAmbiguousPetNames(carobRows)], ["tb/014|carob"]);
  });

  it("leaves unambiguous short names alone", () => {
    const ambiguous = findAmbiguousPetNames([
      { rcrReg: "RR/098", rcrPedigreeName: "Natomah Skoahls Amos", rcrPoints: 10 },
      { rcrReg: "RR/098", rcrPedigreeName: "Akela of Kumiak", rcrPoints: 10 },
    ]);
    assert.equal(ambiguous.size, 0);
    assert.equal(extractPetName("Natomah Skoahls Amos", "RR/098", ambiguous), "amos");
  });

  it("falls back to the full name so the two dogs stay separate", () => {
    const ambiguous = findAmbiguousPetNames(carobRows);
    assert.equal(
      extractPetName("Black Magic of Carob", "TB/014", ambiguous),
      "black magic of carob"
    );
    assert.notEqual(
      getDogMergeKey({
        name: "Black Magic of Carob",
        registration: "TB/014",
        ambiguousPetNames: ambiguous,
      }),
      getDogMergeKey({
        name: "German Son of Carob",
        registration: "TB/014",
        ambiguousPetNames: ambiguous,
      })
    );
  });

  it("keeps colliding RCR rows as separate dogs with their own points", () => {
    const aggregates = aggregateDogPoints([], carobRows);
    const totals = [...aggregates.values()]
      .map((a) => a.pointsWithinCutoff)
      .sort((a, b) => a - b);
    assert.deepEqual(totals, [461.5, 526]);
  });
});

describe("non-scoring classes", () => {
  const entrantFor = (customClass: string): AggPoint[] => [
    {
      points: 20,
      cutoffTime: "00:30:00",
      dogPoints: [{ NZFSSRegistration: "RR/200", points: 20 }],
      entrant: {
        raceTime: "00:20:00",
        class: "speed",
        customClass,
        eventId: "evt1",
        raceType: "speed",
        associatedDog: [{ name: "EMBER", NZFSSRegistration: "RR/200/EMBER" }],
      },
    },
  ];

  // Every spelling recorded in the entrants collection.
  const nonScoring = [
    "Bikejoring", "Canicross", "Canicross - Long", "Canicross - Short",
    "CANICROSS MENS", "CANICROSS WOMENS", "Canicross Men", "Canicross Women",
    "Veterans Bikejor", "Veteran Bikejor", "2 Dog Bikejor", "BIKEJOR 2 DOG",
    "Bikejor 2 dog", "1 dog Bikejor", "Bikejoring - 1 Dog", "2 Dog Bikejoring",
    "1 Dog Bikejour", "VETERAN 1 DOG BIKE", "VETERAN 2 DOG BIKE",
  ];

  const scoring = [
    "Two-Dog Scooter", "Single-Dog Scooter", "4-Dog Rig", "3-Dog Rig", "6-Dog Rig",
    "2-Dog Rig", "Veterans Open", "Junior Advanced", "Pee-Wee", "Novice",
    "VETERAN 1 DOG SCOOTER", "Veteran Single Dog", "36kg (80 Pound) Class", "",
  ];

  it("recognises every recorded bikejoring/canicross spelling", () => {
    for (const customClass of nonScoring) {
      assert.equal(isNonScoringClass({ customClass }), true, `expected non-scoring: ${customClass}`);
    }
  });

  it("does not catch classes that should still score", () => {
    for (const customClass of scoring) {
      assert.equal(isNonScoringClass({ customClass }), false, `expected scoring: ${customClass}`);
    }
  });

  it("awards no points but still counts the race as an event", () => {
    const agg = aggregateDogPoints(entrantFor("Bikejoring"), []).get("reg:rr/200|ember");
    assert.ok(agg);
    assert.equal(agg!.pointsWithinCutoff, 0);
    assert.equal(agg!.pointsOutsideCutoff, 0);
    assert.equal(agg!.events, 1);
  });

  it("still awards points for an ordinary class", () => {
    const agg = aggregateDogPoints(entrantFor("Two-Dog Scooter"), []).get("reg:rr/200|ember");
    assert.ok(agg);
    assert.equal(agg!.pointsWithinCutoff, 20);
    assert.equal(agg!.events, 1);
  });

  it("gives no finishing-position credit toward SDCh", () => {
    const agg = aggregateDogPoints(entrantFor("Canicross"), []).get("reg:rr/200|ember");
    assert.ok(agg);
    assert.deepEqual(agg!.positions, { first: 0, second: 0, third: 0 });
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

describe("cutoff aggregation", () => {
  it("parses RCR cutoff values as integer point counts", () => {
    assert.equal(parseRcrCutoffPoints("2"), 2);
    assert.equal(parseRcrCutoffPoints(2), 2);
    assert.equal(parseRcrCutoffPoints("00:10:45"), 0);
  });

  it("sums historical RCR cutoff point totals", () => {
    const rcr: AggRcrPoint[] = [
      {
        rcrReg: "RR/098",
        rcrPedigreeName: "Howling Spirits Rita at Nalbec",
        rcrCutoff: "2",
      },
    ];
    const cutoffByKey = new Map<string, number>();
    applyCutoffTracking([], rcr, undefined, cutoffByKey);

    const key = "reg:rr/098|rita";
    assert.equal(getCutoffPointsForKey(cutoffByKey, key), 2);
  });

  it("sums cutoffPoints from DogPoint objects", () => {
    const points: AggPoint[] = [
      {
        points: 10,
        dogPoints: [{ NZFSSRegistration: "RR/098", points: 10, cutoffPoints: 1 }],
        entrant: {
          raceTime: "00:15:00",
          class: "Open",
          customClass: "",
          eventId: "evt1",
          raceType: "speed",
          associatedDog: [
            { name: "Akela of Kumiak", NZFSSRegistration: "RR/098" },
          ],
        },
      },
    ];
    const cutoffByKey = new Map<string, number>();
    applyCutoffTracking(points, [], undefined, cutoffByKey);

    const key = "reg:rr/098|akela";
    const total = getCutoffPointsForKey(cutoffByKey, key);
    assert.equal(total, 1);
  });

  it("derives live cutoff points from race time when field is missing", () => {
    const points: AggPoint[] = [
      {
        points: 1,
        cutoffTime: "00:10:45",
        dogPoints: [{ NZFSSRegistration: "RR/098", points: 1 }],
        entrant: {
          raceTime: "00:12:00",
          class: "2 Dog Scooter",
          customClass: "",
          eventId: "evt1",
          raceType: "speed",
          associatedDog: [
            { name: "Howling Spirits Rita at Nalbec", NZFSSRegistration: "RR/098" },
          ],
        },
      },
    ];
    const cutoffByKey = new Map<string, number>();
    applyCutoffTracking(points, [], undefined, cutoffByKey);

    const key = "reg:rr/098|rita";
    assert.equal(getCutoffPointsForKey(cutoffByKey, key), 1);
  });

  it("combines historical and live cutoff points for Rita-style records", () => {
    const points: AggPoint[] = [
      {
        points: 10,
        cutoffTime: "00:10:45",
        dogPoints: [{ NZFSSRegistration: "RR/098", points: 10 }],
        entrant: {
          raceTime: "00:09:30",
          class: "2 Dog Scooter",
          customClass: "",
          eventId: "evt2025",
          raceType: "speed",
          associatedDog: [
            { name: "Howling Spirits Rita at Nalbec", NZFSSRegistration: "RR/098" },
          ],
        },
      },
    ];
    const rcr: AggRcrPoint[] = [
      {
        rcrReg: "RR/098",
        rcrPedigreeName: "Howling Spirits Rita at Nalbec",
        rcrCutoff: "2",
      },
    ];
    const cutoffByKey = new Map<string, number>();
    applyCutoffTracking(points, rcr, undefined, cutoffByKey);

    const key = "reg:rr/098|rita";
    assert.equal(getCutoffPointsForKey(cutoffByKey, key), 2);
  });

  it("sums multiple cutoff points for the same dog", () => {
    const points: AggPoint[] = [
      {
        points: 10,
        dogPoints: [{ NZFSSRegistration: "RR/098", points: 10, cutoffPoints: 1 }],
        entrant: {
          raceTime: "00:15:00",
          class: "Open",
          customClass: "",
          eventId: "evt1",
          raceType: "speed",
          associatedDog: [
            { name: "Akela of Kumiak", NZFSSRegistration: "RR/098" },
          ],
        },
      },
      {
        points: 5,
        dogPoints: [{ NZFSSRegistration: "RR/098", points: 5, cutoffPoints: 1 }],
        entrant: {
          raceTime: "00:18:00",
          class: "Open",
          customClass: "",
          eventId: "evt2",
          raceType: "speed",
          associatedDog: [
            { name: "Akela of Kumiak", NZFSSRegistration: "RR/098" },
          ],
        },
      },
    ];
    const cutoffByKey = new Map<string, number>();
    applyCutoffTracking(points, [], undefined, cutoffByKey);

    const key = "reg:rr/098|akela";
    const total = getCutoffPointsForKey(cutoffByKey, key);
    assert.equal(total, 2);
  });

  it("returns 0 for dogs with no cutoff points", () => {
    const points: AggPoint[] = [
      {
        points: 10,
        cutoffTime: "00:20:00",
        dogPoints: [{ NZFSSRegistration: "RR/099", points: 10, cutoffPoints: 0 }],
        entrant: {
          raceTime: "00:15:00",
          class: "Open",
          customClass: "",
          eventId: "evt1",
          raceType: "speed",
          associatedDog: [
            { name: "Some Dog", NZFSSRegistration: "RR/099" },
          ],
        },
      },
    ];
    const cutoffByKey = new Map<string, number>();
    applyCutoffTracking(points, [], undefined, cutoffByKey);

    const key = "reg:rr/099|some";
    const total = getCutoffPointsForKey(cutoffByKey, key);
    assert.equal(total, 0);
  });
});
