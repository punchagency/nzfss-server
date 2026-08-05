"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const dog_titles_1 = require("./dog-titles");
const dog_points_aggregation_1 = require("./dog-points-aggregation");
const dog_title_service_1 = require("../service/dog-title.service");
const class_eligibility_1 = require("./class-eligibility");
const dog_race_points_service_1 = require("../service/dog-race-points.service");
(0, node_test_1.describe)("determineTitle (mirrors client thresholds)", () => {
    (0, node_test_1.it)("returns null below all thresholds", () => {
        strict_1.default.equal((0, dog_titles_1.determineTitle)({ pointsWithinCutoff: 10, totalPoints: 30, positionCredits: 0 }), null);
    });
    (0, node_test_1.it)("SD at 45 total points", () => {
        strict_1.default.equal((0, dog_titles_1.determineTitle)({ pointsWithinCutoff: 0, totalPoints: 45, positionCredits: 0 }), "SD");
    });
    (0, node_test_1.it)("SDX at 90 within-cutoff points", () => {
        strict_1.default.equal((0, dog_titles_1.determineTitle)({ pointsWithinCutoff: 90, totalPoints: 90, positionCredits: 0 }), "SDX");
    });
    (0, node_test_1.it)("does NOT award SDCh without enough position credits", () => {
        strict_1.default.equal((0, dog_titles_1.determineTitle)({ pointsWithinCutoff: 200, totalPoints: 200, positionCredits: 8 }), "SDX");
    });
    (0, node_test_1.it)("SDCh at 180 points AND 16 position credits", () => {
        strict_1.default.equal((0, dog_titles_1.determineTitle)({ pointsWithinCutoff: 180, totalPoints: 180, positionCredits: 16 }), "SDCh");
    });
    (0, node_test_1.it)("position credits: 1st=4, 2nd=2, 3rd=1", () => {
        strict_1.default.equal((0, dog_titles_1.positionCreditsFor)({ first: 4, second: 0, third: 0 }), 16);
        strict_1.default.equal((0, dog_titles_1.positionCreditsFor)({ first: 0, second: 8, third: 0 }), 16);
        strict_1.default.equal((0, dog_titles_1.positionCreditsFor)({ first: 0, second: 0, third: 16 }), 16);
    });
});
(0, node_test_1.describe)("title ranking + recognition rules", () => {
    (0, node_test_1.it)("ranks SD < SDX < SDCh", () => {
        strict_1.default.ok((0, dog_titles_1.titleRank)("SD") < (0, dog_titles_1.titleRank)("SDX"));
        strict_1.default.ok((0, dog_titles_1.titleRank)("SDX") < (0, dog_titles_1.titleRank)("SDCh"));
        strict_1.default.equal((0, dog_titles_1.titleRank)(null), -1);
    });
    (0, node_test_1.it)("achievedTitlesUpTo cascades downward", () => {
        strict_1.default.deepEqual((0, dog_titles_1.achievedTitlesUpTo)("SDCh"), { SD: true, SDX: true, SDCh: true });
        strict_1.default.deepEqual((0, dog_titles_1.achievedTitlesUpTo)("SDX"), { SD: true, SDX: true, SDCh: false });
        strict_1.default.deepEqual((0, dog_titles_1.achievedTitlesUpTo)(null), { SD: false, SDX: false, SDCh: false });
    });
    (0, node_test_1.it)("highestRecognisedTitle returns the top set flag", () => {
        strict_1.default.equal((0, dog_titles_1.highestRecognisedTitle)({ sd: true, sdx: true, sdCh: false }), "SDX");
        strict_1.default.equal((0, dog_titles_1.highestRecognisedTitle)({ sd: false, sdx: false, sdCh: false }), null);
        strict_1.default.equal((0, dog_titles_1.highestRecognisedTitle)(undefined), null);
    });
    (0, node_test_1.it)("excludes dogs with no earned title", () => {
        strict_1.default.equal((0, dog_titles_1.isUnrecognisedTitleChange)(null, { sd: false, sdx: false, sdCh: false }), false);
    });
    (0, node_test_1.it)("excludes when highest earned title already recognised", () => {
        strict_1.default.equal((0, dog_titles_1.isUnrecognisedTitleChange)("SDX", { sd: true, sdx: true, sdCh: false }), false);
    });
    (0, node_test_1.it)("includes when highest earned title not yet recognised", () => {
        strict_1.default.equal((0, dog_titles_1.isUnrecognisedTitleChange)("SDX", { sd: true, sdx: false, sdCh: false }), true);
        strict_1.default.equal((0, dog_titles_1.isUnrecognisedTitleChange)("SD", { sd: false, sdx: false, sdCh: false }), true);
    });
});
(0, node_test_1.describe)("pet name extraction + merge keys", () => {
    (0, node_test_1.it)("extracts pet name from pedigree-style names", () => {
        strict_1.default.equal((0, dog_points_aggregation_1.extractPetName)("Nalbec's Finn"), "finn");
        strict_1.default.equal((0, dog_points_aggregation_1.extractPetName)("Howling Spirits Rita at Nalbec"), "rita");
        strict_1.default.equal((0, dog_points_aggregation_1.extractPetName)("Akela of Kumiak", "RR/098/AKELA"), "akela");
        strict_1.default.equal((0, dog_points_aggregation_1.extractPetName)("Akela of Kumiak", "RR/098"), "akela");
        strict_1.default.equal((0, dog_points_aggregation_1.extractPetName)("Natomah Skoahls Amos", "RR/098"), "amos");
    });
    (0, node_test_1.it)("merges AMOS and AKELA historical + live via reg key", () => {
        strict_1.default.equal((0, dog_points_aggregation_1.getDogMergeKey)({ name: "Natomah Skoahls Amos", registration: "RR/098" }), (0, dog_points_aggregation_1.getDogMergeKey)({ name: "AMOS", registration: "RR/098/AMOS" }));
        strict_1.default.equal((0, dog_points_aggregation_1.getDogMergeKey)({ name: "Akela of Kumiak", registration: "RR/098" }), (0, dog_points_aggregation_1.getDogMergeKey)({ name: "AKELA", registration: "RR/098" }));
    });
    (0, node_test_1.it)("prefers dogId for merge key, falls back to reg+name", () => {
        strict_1.default.equal((0, dog_points_aggregation_1.getDogMergeKey)({ dogId: "ABC" }), "id:abc");
        strict_1.default.equal((0, dog_points_aggregation_1.getDogMergeKey)({ name: "Nalbec's Finn", registration: "RR/098" }), "reg:rr/098|finn");
    });
});
(0, node_test_1.describe)("ambiguous pet names", () => {
    const carobRows = [
        { rcrReg: "TB/014", rcrPedigreeName: "Black Magic of Carob", rcrPoints: 461.5 },
        { rcrReg: "TB/014", rcrPedigreeName: "German Son of Carob", rcrPoints: 526 },
    ];
    (0, node_test_1.it)("flags a short name claimed by two pedigree names in one kennel", () => {
        strict_1.default.deepEqual([...(0, dog_points_aggregation_1.findAmbiguousPetNames)(carobRows)], ["tb/014|carob"]);
    });
    (0, node_test_1.it)("leaves unambiguous short names alone", () => {
        const ambiguous = (0, dog_points_aggregation_1.findAmbiguousPetNames)([
            { rcrReg: "RR/098", rcrPedigreeName: "Natomah Skoahls Amos", rcrPoints: 10 },
            { rcrReg: "RR/098", rcrPedigreeName: "Akela of Kumiak", rcrPoints: 10 },
        ]);
        strict_1.default.equal(ambiguous.size, 0);
        strict_1.default.equal((0, dog_points_aggregation_1.extractPetName)("Natomah Skoahls Amos", "RR/098", ambiguous), "amos");
    });
    (0, node_test_1.it)("falls back to the full name so the two dogs stay separate", () => {
        const ambiguous = (0, dog_points_aggregation_1.findAmbiguousPetNames)(carobRows);
        strict_1.default.equal((0, dog_points_aggregation_1.extractPetName)("Black Magic of Carob", "TB/014", ambiguous), "black magic of carob");
        strict_1.default.notEqual((0, dog_points_aggregation_1.getDogMergeKey)({
            name: "Black Magic of Carob",
            registration: "TB/014",
            ambiguousPetNames: ambiguous,
        }), (0, dog_points_aggregation_1.getDogMergeKey)({
            name: "German Son of Carob",
            registration: "TB/014",
            ambiguousPetNames: ambiguous,
        }));
    });
    (0, node_test_1.it)("keeps colliding RCR rows as separate dogs with their own points", () => {
        const aggregates = (0, dog_points_aggregation_1.aggregateDogPoints)([], carobRows);
        const totals = [...aggregates.values()]
            .map((a) => a.pointsWithinCutoff)
            .sort((a, b) => a - b);
        strict_1.default.deepEqual(totals, [461.5, 526]);
    });
});
(0, node_test_1.describe)("non-scoring classes", () => {
    const entrantFor = (customClass) => [
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
    (0, node_test_1.it)("recognises every recorded bikejoring/canicross spelling", () => {
        for (const customClass of nonScoring) {
            strict_1.default.equal((0, class_eligibility_1.isNonScoringClass)({ customClass }), true, `expected non-scoring: ${customClass}`);
        }
    });
    (0, node_test_1.it)("does not catch classes that should still score", () => {
        for (const customClass of scoring) {
            strict_1.default.equal((0, class_eligibility_1.isNonScoringClass)({ customClass }), false, `expected scoring: ${customClass}`);
        }
    });
    (0, node_test_1.it)("awards no points but still counts the race as an event", () => {
        const agg = (0, dog_points_aggregation_1.aggregateDogPoints)(entrantFor("Bikejoring"), []).get("reg:rr/200|ember");
        strict_1.default.ok(agg);
        strict_1.default.equal(agg.pointsWithinCutoff, 0);
        strict_1.default.equal(agg.pointsOutsideCutoff, 0);
        strict_1.default.equal(agg.events, 1);
    });
    (0, node_test_1.it)("still awards points for an ordinary class", () => {
        const agg = (0, dog_points_aggregation_1.aggregateDogPoints)(entrantFor("Two-Dog Scooter"), []).get("reg:rr/200|ember");
        strict_1.default.ok(agg);
        strict_1.default.equal(agg.pointsWithinCutoff, 20);
        strict_1.default.equal(agg.events, 1);
    });
    (0, node_test_1.it)("gives no finishing-position credit toward SDCh", () => {
        const agg = (0, dog_points_aggregation_1.aggregateDogPoints)(entrantFor("Canicross"), []).get("reg:rr/200|ember");
        strict_1.default.ok(agg);
        strict_1.default.deepEqual(agg.positions, { first: 0, second: 0, third: 0 });
    });
});
(0, node_test_1.describe)("aggregateDogPoints", () => {
    (0, node_test_1.it)("merges live FINN and historical Nalbec's Finn into one dog", () => {
        const points = [
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
        const rcr = [
            { rcrReg: "RR/098", rcrPedigreeName: "Nalbec's Finn", rcrPoints: 264.5, rcrEvents: 9 },
        ];
        const result = (0, dog_points_aggregation_1.aggregateDogPoints)(points, rcr);
        strict_1.default.equal(result.size, 1);
        const agg = result.get("reg:rr/098|finn");
        strict_1.default.ok(agg);
        strict_1.default.equal(agg.events, 10);
        strict_1.default.equal(agg.pointsWithinCutoff, 314.5);
    });
    (0, node_test_1.it)("does not collapse RCR rows that share a bad kennel-level dogId", () => {
        const sharedDogId = "11111111-1111-4111-8111-111111111111";
        const rcr = [
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
        const result = (0, dog_points_aggregation_1.aggregateDogPoints)([], rcr);
        strict_1.default.equal(result.size, 3);
        strict_1.default.ok(result.get("reg:rr/098|finn"));
        strict_1.default.ok(result.get("reg:rr/098|willow"));
        strict_1.default.ok(result.get("reg:rr/098|akela"));
    });
    (0, node_test_1.it)("merges Akela RCR and live when live rows share a bad kennel dogId", () => {
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
        const points = [
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
        const rcr = [
            {
                dogId: sharedDogId,
                rcrReg: "RR/098",
                rcrPedigreeName: "Akela of Kumiak",
                rcrPoints: 645.5,
                rcrEvents: 0,
                rcrAwards: "SDCh",
            },
        ];
        const { resolveKey } = (0, dog_title_service_1.buildKeyResolver)(registry, points, rcr);
        const result = (0, dog_points_aggregation_1.aggregateDogPoints)(points, rcr, resolveKey);
        strict_1.default.equal(result.size, 1);
        const agg = result.get(`id:${akelaDogId}`);
        strict_1.default.ok(agg);
        strict_1.default.equal(agg.pointsWithinCutoff, 720);
        strict_1.default.equal(agg.events, 1);
    });
    (0, node_test_1.it)("awards first place to the fastest entrant in a class", () => {
        const points = [
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
        const result = (0, dog_points_aggregation_1.aggregateDogPoints)(points, []);
        strict_1.default.equal(result.get("id:dog-a").positions.first, 1);
        strict_1.default.equal(result.get("id:dog-b").positions.second, 1);
    });
});
(0, node_test_1.describe)("cutoff aggregation", () => {
    (0, node_test_1.it)("parses RCR cutoff values as integer point counts", () => {
        strict_1.default.equal((0, dog_race_points_service_1.parseRcrCutoffPoints)("2"), 2);
        strict_1.default.equal((0, dog_race_points_service_1.parseRcrCutoffPoints)(2), 2);
        strict_1.default.equal((0, dog_race_points_service_1.parseRcrCutoffPoints)("00:10:45"), 0);
    });
    (0, node_test_1.it)("sums historical RCR cutoff point totals", () => {
        const rcr = [
            {
                rcrReg: "RR/098",
                rcrPedigreeName: "Howling Spirits Rita at Nalbec",
                rcrCutoff: "2",
            },
        ];
        const cutoffByKey = new Map();
        (0, dog_race_points_service_1.applyCutoffTracking)([], rcr, undefined, cutoffByKey);
        const key = "reg:rr/098|rita";
        strict_1.default.equal((0, dog_race_points_service_1.getCutoffPointsForKey)(cutoffByKey, key), 2);
    });
    (0, node_test_1.it)("sums cutoffPoints from DogPoint objects", () => {
        const points = [
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
        const cutoffByKey = new Map();
        (0, dog_race_points_service_1.applyCutoffTracking)(points, [], undefined, cutoffByKey);
        const key = "reg:rr/098|akela";
        const total = (0, dog_race_points_service_1.getCutoffPointsForKey)(cutoffByKey, key);
        strict_1.default.equal(total, 1);
    });
    (0, node_test_1.it)("derives live cutoff points from race time when field is missing", () => {
        const points = [
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
        const cutoffByKey = new Map();
        (0, dog_race_points_service_1.applyCutoffTracking)(points, [], undefined, cutoffByKey);
        const key = "reg:rr/098|rita";
        strict_1.default.equal((0, dog_race_points_service_1.getCutoffPointsForKey)(cutoffByKey, key), 1);
    });
    (0, node_test_1.it)("combines historical and live cutoff points for Rita-style records", () => {
        const points = [
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
        const rcr = [
            {
                rcrReg: "RR/098",
                rcrPedigreeName: "Howling Spirits Rita at Nalbec",
                rcrCutoff: "2",
            },
        ];
        const cutoffByKey = new Map();
        (0, dog_race_points_service_1.applyCutoffTracking)(points, rcr, undefined, cutoffByKey);
        const key = "reg:rr/098|rita";
        strict_1.default.equal((0, dog_race_points_service_1.getCutoffPointsForKey)(cutoffByKey, key), 2);
    });
    (0, node_test_1.it)("sums multiple cutoff points for the same dog", () => {
        const points = [
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
        const cutoffByKey = new Map();
        (0, dog_race_points_service_1.applyCutoffTracking)(points, [], undefined, cutoffByKey);
        const key = "reg:rr/098|akela";
        const total = (0, dog_race_points_service_1.getCutoffPointsForKey)(cutoffByKey, key);
        strict_1.default.equal(total, 2);
    });
    (0, node_test_1.it)("returns 0 for dogs with no cutoff points", () => {
        const points = [
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
        const cutoffByKey = new Map();
        (0, dog_race_points_service_1.applyCutoffTracking)(points, [], undefined, cutoffByKey);
        const key = "reg:rr/099|some";
        const total = (0, dog_race_points_service_1.getCutoffPointsForKey)(cutoffByKey, key);
        strict_1.default.equal(total, 0);
    });
});
//# sourceMappingURL=dog-titles.test.js.map