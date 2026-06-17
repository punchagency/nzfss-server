"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeDogRacePointSummaries = computeDogRacePointSummaries;
const dog_points_aggregation_1 = require("../utils/dog-points-aggregation");
const dog_title_service_1 = require("./dog-title.service");
function parseRcrCutoffSeconds(rcrCutoff) {
    if (rcrCutoff === null || rcrCutoff === undefined || rcrCutoff === "")
        return 0;
    if (typeof rcrCutoff === "number") {
        return rcrCutoff > 0 ? rcrCutoff * 60 : 0;
    }
    const numericValue = parseFloat(rcrCutoff);
    if (!isNaN(numericValue) && !rcrCutoff.includes(":")) {
        return numericValue > 0 ? numericValue * 60 : 0;
    }
    return (0, dog_points_aggregation_1.timeToSeconds)(rcrCutoff) < Number.MAX_VALUE ? (0, dog_points_aggregation_1.timeToSeconds)(rcrCutoff) : 0;
}
function trackCutoff(cutoffByKey, key, seconds) {
    if (seconds <= 0)
        return;
    const existing = cutoffByKey.get(key) || { sum: 0, count: 0 };
    existing.sum += seconds;
    existing.count += 1;
    cutoffByKey.set(key, existing);
}
function applyCutoffTracking(points, rcrPoints, resolveKey, cutoffByKey) {
    const keyOf = (naturalKey) => (resolveKey && resolveKey(naturalKey)) || naturalKey;
    const ambiguousRcrDogIds = (0, dog_points_aggregation_1.findAmbiguousRcrDogIds)(rcrPoints);
    for (const point of points) {
        const entrant = point.entrant;
        if (!entrant || !Array.isArray(entrant.associatedDog) || entrant.associatedDog.length === 0) {
            continue;
        }
        const storedCutoff = (0, dog_points_aggregation_1.timeToSeconds)(point.cutoffTime);
        if (storedCutoff >= Number.MAX_VALUE || storedCutoff <= 0)
            continue;
        for (const dog of entrant.associatedDog) {
            const naturalKey = (0, dog_points_aggregation_1.getLiveDogMergeKey)(dog, ambiguousRcrDogIds);
            trackCutoff(cutoffByKey, keyOf(naturalKey), storedCutoff);
        }
    }
    for (const rcr of rcrPoints) {
        const name = rcr.rcrPedigreeName;
        if (!name || name.trim() === "" || name.toLowerCase() === "n/a")
            continue;
        const naturalKey = (0, dog_points_aggregation_1.getRcrMergeKey)(rcr, ambiguousRcrDogIds);
        trackCutoff(cutoffByKey, keyOf(naturalKey), parseRcrCutoffSeconds(rcr.rcrCutoff));
    }
}
function summaryFromAggregate(agg, avgCutoffSeconds) {
    const title = (0, dog_title_service_1.earnedTitleFor)(agg);
    return {
        name: agg.displayName,
        regNumber: agg.kennelReg || "N/A",
        breed: agg.breed || "Unknown",
        pointsWithinCutoff: agg.pointsWithinCutoff,
        pointsOutsideCutoff: agg.pointsOutsideCutoff,
        events: agg.events,
        avgCutoffSeconds,
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
        const cutoff = cutoffByKey.get(agg.key);
        const avgCutoffSeconds = cutoff && cutoff.count > 0 ? cutoff.sum / cutoff.count : null;
        return summaryFromAggregate(agg, avgCutoffSeconds);
    });
    summaries.sort((a, b) => {
        const aTotal = a.pointsWithinCutoff + a.pointsOutsideCutoff;
        const bTotal = b.pointsWithinCutoff + b.pointsOutsideCutoff;
        return bTotal - aTotal;
    });
    return summaries;
}
//# sourceMappingURL=dog-race-points.service.js.map