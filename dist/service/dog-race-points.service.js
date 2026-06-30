"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRcrCutoffPoints = parseRcrCutoffPoints;
exports.applyCutoffTracking = applyCutoffTracking;
exports.getCutoffPointsForKey = getCutoffPointsForKey;
exports.computeDogRacePointSummaries = computeDogRacePointSummaries;
const dog_points_aggregation_1 = require("../utils/dog-points-aggregation");
const dog_title_service_1 = require("./dog-title.service");
function parseRcrCutoffPoints(rcrCutoff) {
    if (rcrCutoff === null || rcrCutoff === undefined || rcrCutoff === "")
        return 0;
    if (typeof rcrCutoff === "number") {
        return rcrCutoff >= 0 && Number.isInteger(rcrCutoff) ? rcrCutoff : 0;
    }
    const trimmed = rcrCutoff.trim();
    if (!trimmed)
        return 0;
    if (/^\d{1,2}:\d{2}:\d{2}/.test(trimmed))
        return 0;
    const numericValue = Number(trimmed);
    if (!Number.isFinite(numericValue) || numericValue < 0)
        return 0;
    return Number.isInteger(numericValue) ? numericValue : Math.floor(numericValue);
}
function liveCutoffPointsForRace(point, dogPoint, entrant) {
    if (typeof dogPoint?.cutoffPoints === "number" && !Number.isNaN(dogPoint.cutoffPoints)) {
        return dogPoint.cutoffPoints;
    }
    const storedCutoff = (0, dog_points_aggregation_1.timeToSeconds)(point.cutoffTime);
    const raceTime = (0, dog_points_aggregation_1.timeToSeconds)(entrant.raceTime);
    if (storedCutoff >= Number.MAX_VALUE || raceTime >= Number.MAX_VALUE)
        return 0;
    return raceTime > storedCutoff ? 1 : 0;
}
function applyCutoffTracking(points, rcrPoints, resolveKey, cutoffByKey) {
    const keyOf = (naturalKey) => (resolveKey && resolveKey(naturalKey)) || naturalKey;
    const ambiguousRcrDogIds = (0, dog_points_aggregation_1.findAmbiguousRcrDogIds)(rcrPoints);
    for (const rcr of rcrPoints) {
        const name = rcr.rcrPedigreeName;
        if (!name || name.trim() === "" || name.toLowerCase() === "n/a")
            continue;
        const historicalCutoffPoints = parseRcrCutoffPoints(rcr.rcrCutoff);
        if (historicalCutoffPoints <= 0)
            continue;
        const naturalKey = (0, dog_points_aggregation_1.getRcrMergeKey)(rcr, ambiguousRcrDogIds);
        const key = keyOf(naturalKey);
        cutoffByKey.set(key, (cutoffByKey.get(key) || 0) + historicalCutoffPoints);
    }
    for (const point of points) {
        const entrant = point.entrant;
        if (!entrant || !Array.isArray(entrant.associatedDog) || entrant.associatedDog.length === 0) {
            continue;
        }
        for (const dog of entrant.associatedDog) {
            const naturalKey = (0, dog_points_aggregation_1.getLiveDogMergeKey)(dog, ambiguousRcrDogIds);
            const key = keyOf(naturalKey);
            const dogPoint = point.dogPoints?.find((dp) => (dog.dogId && dp.dogId === dog.dogId) ||
                dp.NZFSSRegistration === dog.NZFSSRegistration);
            const raceCutoffPoints = liveCutoffPointsForRace(point, dogPoint, entrant);
            if (raceCutoffPoints <= 0)
                continue;
            cutoffByKey.set(key, (cutoffByKey.get(key) || 0) + raceCutoffPoints);
        }
    }
}
function getCutoffPointsForKey(cutoffByKey, key) {
    return cutoffByKey.get(key) || 0;
}
function summaryFromAggregate(agg, cutoffPoints) {
    const title = (0, dog_title_service_1.earnedTitleFor)(agg);
    return {
        name: agg.displayName,
        regNumber: agg.kennelReg || "N/A",
        breed: agg.breed || "Unknown",
        pointsWithinCutoff: agg.pointsWithinCutoff,
        pointsOutsideCutoff: agg.pointsOutsideCutoff,
        events: agg.events,
        cutoffPoints,
        awards: title || "",
    };
}
async function computeDogRacePointSummaries() {
    const registry = await (0, dog_title_service_1.loadRegistryDogs)();
    const { points, rcrPoints } = await (0, dog_title_service_1.loadAggregationInputs)();
    const { resolveKey } = (0, dog_title_service_1.buildKeyResolver)(registry, points, rcrPoints);
    const aggregates = (0, dog_points_aggregation_1.aggregateDogPoints)(points, rcrPoints, resolveKey);
    const cutoffByKey = new Map();
    applyCutoffTracking(points, rcrPoints, resolveKey, cutoffByKey);
    const summaries = Array.from(aggregates.values())
        .filter((agg) => agg.displayName &&
        agg.displayName.trim() !== "" &&
        agg.displayName.toLowerCase() !== "n/a")
        .map((agg) => {
        const cutoffPoints = getCutoffPointsForKey(cutoffByKey, agg.key);
        return summaryFromAggregate(agg, cutoffPoints);
    });
    summaries.sort((a, b) => {
        const aTotal = a.pointsWithinCutoff + a.pointsOutsideCutoff;
        const bTotal = b.pointsWithinCutoff + b.pointsOutsideCutoff;
        return bTotal - aTotal;
    });
    return summaries;
}
//# sourceMappingURL=dog-race-points.service.js.map