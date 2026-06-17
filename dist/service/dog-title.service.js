"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTitleFromAwards = parseTitleFromAwards;
exports.loadRegistryDogs = loadRegistryDogs;
exports.buildKeyResolver = buildKeyResolver;
exports.loadAggregationInputs = loadAggregationInputs;
exports.earnedTitleFor = earnedTitleFor;
exports.computeDogTitleStatuses = computeDogTitleStatuses;
exports.getUnrecognisedTitleChanges = getUnrecognisedTitleChanges;
exports.recogniseTitleChanges = recogniseTitleChanges;
const musher_model_1 = require("../models/musher.model");
const point_schema_1 = require("../schema/point.schema");
const entrants_schema_1 = require("../schema/entrants.schema");
const rcrpoints_schema_1 = require("../schema/rcrpoints.schema");
const dog_id_1 = require("../utils/dog-id");
const dog_points_aggregation_1 = require("../utils/dog-points-aggregation");
const dog_titles_1 = require("../utils/dog-titles");
function parseTitleFromAwards(awards) {
    const value = (awards || "").toLowerCase();
    if (!value)
        return null;
    if (value.includes("sdch"))
        return "SDCh";
    if (value.includes("sdx"))
        return "SDX";
    if (/\bsd\b/.test(value) || value.includes("sled dog"))
        return "SD";
    return null;
}
function canonicalKey(dogId) {
    return `id:${dogId.trim().toLowerCase()}`;
}
async function loadRegistryDogs() {
    const mushers = await musher_model_1.MusherModel.find().lean();
    const registry = [];
    for (const musher of mushers) {
        const dogs = (musher.dogs || []);
        for (const dog of dogs) {
            if (!(0, dog_id_1.isValidDogId)(dog.dogId))
                continue;
            registry.push({
                musherId: musher._id.toString(),
                ownerName: musher.name || "",
                dogId: dog.dogId,
                name: dog.name || "",
                pedigreeName: dog.pedigreeName || "",
                nzfssNo: dog.nzfssNo || "",
                breed: dog.breed || "",
                flags: {
                    sd: Boolean(dog.titleRecognition?.sd),
                    sdx: Boolean(dog.titleRecognition?.sdx),
                    sdCh: Boolean(dog.titleRecognition?.sdCh),
                },
            });
        }
    }
    return registry;
}
function registryLabelKeys(dog) {
    const keys = new Set();
    const { kennelReg } = (0, dog_points_aggregation_1.parseRegistration)(dog.nzfssNo);
    const hasPetSuffix = Boolean((0, dog_points_aggregation_1.parseRegistration)(dog.nzfssNo).petNameFromReg);
    for (const label of [dog.name, dog.pedigreeName]) {
        if (!label?.trim())
            continue;
        keys.add((0, dog_points_aggregation_1.getDogMergeKey)({ name: label, registration: dog.nzfssNo }));
        if (hasPetSuffix && kennelReg) {
            keys.add((0, dog_points_aggregation_1.getDogMergeKey)({ name: label, registration: kennelReg }));
        }
    }
    return [...keys];
}
function buildKeyResolver(registry, points, rcrPoints) {
    const byCanonical = new Map();
    const map = new Map();
    const regKeyToDogIds = new Map();
    for (const dog of registry) {
        const canonical = canonicalKey(dog.dogId);
        byCanonical.set(canonical, dog);
        map.set(canonical, canonical);
        map.set(`id:${dog.dogId.toLowerCase()}`, canonical);
        for (const regKey of registryLabelKeys(dog)) {
            if (!regKeyToDogIds.has(regKey))
                regKeyToDogIds.set(regKey, new Set());
            regKeyToDogIds.get(regKey).add(dog.dogId);
        }
    }
    for (const [regKey, dogIds] of regKeyToDogIds) {
        if (dogIds.size === 1) {
            map.set(regKey, canonicalKey([...dogIds][0]));
        }
    }
    const ambiguousRcrDogIds = (0, dog_points_aggregation_1.findAmbiguousRcrDogIds)(rcrPoints || []);
    if (points) {
        for (const point of points) {
            const entrant = point.entrant;
            if (entrant && Array.isArray(entrant.associatedDog)) {
                for (const dog of entrant.associatedDog) {
                    const regKeyOnly = (0, dog_points_aggregation_1.getDogMergeKey)({
                        name: dog.name,
                        registration: dog.NZFSSRegistration,
                    });
                    const dogId = dog.dogId?.trim().toLowerCase();
                    if (!dogId || ambiguousRcrDogIds.has(dogId))
                        continue;
                    const canonicalId = `id:${dogId}`;
                    if (byCanonical.has(canonicalId)) {
                        map.set(regKeyOnly, canonicalId);
                    }
                    else {
                        const registryId = map.get(regKeyOnly);
                        if (registryId) {
                            map.set(canonicalId, registryId);
                        }
                    }
                }
            }
        }
    }
    if (rcrPoints) {
        for (const rcr of rcrPoints) {
            const rcrDogId = rcr.dogId?.trim().toLowerCase();
            if (!rcrDogId || ambiguousRcrDogIds.has(rcrDogId))
                continue;
            const canonicalId = `id:${rcrDogId}`;
            if (!byCanonical.has(canonicalId)) {
                const regKey = (0, dog_points_aggregation_1.getRcrMergeKey)(rcr, ambiguousRcrDogIds);
                const registryId = map.get(regKey);
                if (registryId) {
                    map.set(canonicalId, registryId);
                }
            }
        }
    }
    const resolveKey = (naturalKey) => map.get(naturalKey);
    return { resolveKey, byCanonical };
}
async function loadAggregationInputs() {
    const points = await point_schema_1.PointModel.find({}).lean();
    const entrantIds = points.map((p) => p.entrantId);
    const entrants = await entrants_schema_1.EntrantModel.find({ _id: { $in: entrantIds } }).lean();
    const entrantMap = new Map();
    entrants.forEach((e) => entrantMap.set(e._id.toString(), e));
    const aggPoints = points.map((p) => {
        const entrant = entrantMap.get(p.entrantId.toString());
        return {
            points: p.points,
            cutoffTime: p.cutoffTime || null,
            dogPoints: (p.dogPoints || []),
            entrant: entrant
                ? {
                    raceTime: entrant.raceTime || null,
                    class: entrant.class,
                    customClass: entrant.customClass,
                    eventId: entrant.eventId ? entrant.eventId.toString() : undefined,
                    raceType: entrant.raceType,
                    associatedDog: entrant.associatedDog || [],
                }
                : null,
        };
    });
    const rcrRows = await rcrpoints_schema_1.RcrPointsModel.find({}).lean();
    const rcrPoints = rcrRows.map((r) => ({
        dogId: r.dogId,
        rcrReg: r.rcrReg,
        rcrFlag: r.rcrFlag,
        rcrPedigreeName: r.rcrPedigreeName,
        rcrBreed: r.rcrBreed,
        rcrPoints: r.rcrPoints,
        rcrEvents: r.rcrEvents,
        rcrAwards: r.rcrAwards,
        rcrCutoff: r.rcrCutoff,
    }));
    return { points: aggPoints, rcrPoints };
}
function earnedTitleFor(aggregate) {
    if (!aggregate)
        return null;
    const calculated = (0, dog_titles_1.determineTitle)({
        pointsWithinCutoff: aggregate.pointsWithinCutoff,
        totalPoints: aggregate.pointsWithinCutoff + aggregate.pointsOutsideCutoff,
        positionCredits: (0, dog_titles_1.positionCreditsFor)(aggregate.positions),
    });
    const historical = parseTitleFromAwards(aggregate.historicalAwards);
    if ((0, dog_titles_1.titleRank)(historical) > (0, dog_titles_1.titleRank)(calculated))
        return historical;
    return calculated;
}
async function computeDogTitleStatuses() {
    const registry = await loadRegistryDogs();
    const { points, rcrPoints } = await loadAggregationInputs();
    const { resolveKey, byCanonical } = buildKeyResolver(registry, points, rcrPoints);
    const aggregates = (0, dog_points_aggregation_1.aggregateDogPoints)(points, rcrPoints, resolveKey);
    const statuses = [];
    for (const [canonical, registryDog] of byCanonical) {
        const aggregate = aggregates.get(canonical);
        const earnedTitle = earnedTitleFor(aggregate);
        const recognisedTitle = (0, dog_titles_1.highestRecognisedTitle)(registryDog.flags);
        statuses.push({
            registryDog,
            aggregate,
            earnedTitle,
            recognisedTitle,
            isUnrecognised: (0, dog_titles_1.isUnrecognisedTitleChange)(earnedTitle, registryDog.flags),
        });
    }
    return statuses;
}
async function getUnrecognisedTitleChanges() {
    const statuses = await computeDogTitleStatuses();
    return statuses
        .filter((s) => s.isUnrecognised && s.earnedTitle)
        .map((s) => {
        const points = (s.aggregate?.pointsWithinCutoff || 0) + (s.aggregate?.pointsOutsideCutoff || 0);
        return {
            dogId: s.registryDog.dogId,
            musherId: s.registryDog.musherId,
            dogName: s.registryDog.name,
            pedigreeName: s.registryDog.pedigreeName,
            nzfssNo: s.registryDog.nzfssNo,
            ownerName: s.registryDog.ownerName,
            breed: s.registryDog.breed,
            previousTitle: s.recognisedTitle ? dog_titles_1.TITLE_LABELS[s.recognisedTitle] : "None",
            newTitle: dog_titles_1.TITLE_LABELS[s.earnedTitle],
            previousTitleCode: s.recognisedTitle,
            newTitleCode: s.earnedTitle,
            points: Math.round(points * 10) / 10,
            events: s.aggregate?.events || 0,
        };
    })
        .sort((a, b) => a.ownerName.localeCompare(b.ownerName) || a.dogName.localeCompare(b.dogName));
}
async function recogniseTitleChanges(dogIds) {
    const uniqueIds = Array.from(new Set(dogIds.filter((id) => (0, dog_id_1.isValidDogId)(id))));
    if (uniqueIds.length === 0)
        return 0;
    const statuses = await computeDogTitleStatuses();
    const statusByDogId = new Map(statuses.map((s) => [s.registryDog.dogId, s]));
    let recognisedCount = 0;
    for (const dogId of uniqueIds) {
        const status = statusByDogId.get(dogId);
        if (!status || !status.earnedTitle)
            continue;
        if (!status.isUnrecognised)
            continue;
        const achieved = (0, dog_titles_1.achievedTitlesUpTo)(status.earnedTitle);
        const setFields = {};
        Object.keys(achieved).forEach((title) => {
            if (achieved[title]) {
                setFields[`dogs.$.titleRecognition.${(0, dog_titles_1.recognitionKey)(title)}`] = true;
            }
        });
        const result = await musher_model_1.MusherModel.updateOne({ _id: status.registryDog.musherId, "dogs.dogId": dogId }, { $set: setFields });
        if (result.modifiedCount && result.modifiedCount > 0)
            recognisedCount++;
    }
    return recognisedCount;
}
//# sourceMappingURL=dog-title.service.js.map