import {
  aggregateDogPoints,
  findAmbiguousRcrDogIds,
  getLiveDogMergeKey,
  getRcrMergeKey,
  parseRegistration,
  timeToSeconds,
  type AggRcrPoint,
  type AggPoint,
  type DogAggregate,
  type KeyResolver,
} from "../utils/dog-points-aggregation";
import {
  buildKeyResolver,
  earnedTitleFor,
  loadAggregationInputs,
  loadRegistryDogs,
} from "./dog-title.service";

export interface DogRacePointSummary {
  name: string;
  regNumber: string;
  breed: string;
  pointsWithinCutoff: number;
  pointsOutsideCutoff: number;
  events: number;
  avgCutoffSeconds: number | null;
  awards: string;
}

function parseRcrCutoffSeconds(rcrCutoff?: string | number | null): number {
  if (rcrCutoff === null || rcrCutoff === undefined || rcrCutoff === "") return 0;

  if (typeof rcrCutoff === "number") {
    return rcrCutoff > 0 ? rcrCutoff * 60 : 0;
  }

  const numericValue = parseFloat(rcrCutoff);
  if (!isNaN(numericValue) && !rcrCutoff.includes(":")) {
    return numericValue > 0 ? numericValue * 60 : 0;
  }

  return timeToSeconds(rcrCutoff) < Number.MAX_VALUE ? timeToSeconds(rcrCutoff) : 0;
}

function trackCutoff(
  cutoffByKey: Map<string, { sum: number; count: number }>,
  key: string,
  seconds: number
): void {
  if (seconds <= 0) return;
  const existing = cutoffByKey.get(key) || { sum: 0, count: 0 };
  existing.sum += seconds;
  existing.count += 1;
  cutoffByKey.set(key, existing);
}

function applyCutoffTracking(
  points: AggPoint[],
  rcrPoints: AggRcrPoint[],
  resolveKey: KeyResolver,
  cutoffByKey: Map<string, { sum: number; count: number }>
): void {
  const keyOf = (naturalKey: string): string =>
    (resolveKey && resolveKey(naturalKey)) || naturalKey;
  const ambiguousRcrDogIds = findAmbiguousRcrDogIds(rcrPoints);

  for (const point of points) {
    const entrant = point.entrant;
    if (!entrant || !Array.isArray(entrant.associatedDog) || entrant.associatedDog.length === 0) {
      continue;
    }

    const storedCutoff = timeToSeconds(point.cutoffTime);
    if (storedCutoff >= Number.MAX_VALUE || storedCutoff <= 0) continue;

    for (const dog of entrant.associatedDog) {
      const naturalKey = getLiveDogMergeKey(dog, ambiguousRcrDogIds);
      trackCutoff(cutoffByKey, keyOf(naturalKey), storedCutoff);
    }
  }

  for (const rcr of rcrPoints) {
    const name = rcr.rcrPedigreeName;
    if (!name || name.trim() === "" || name.toLowerCase() === "n/a") continue;

    const naturalKey = getRcrMergeKey(rcr, ambiguousRcrDogIds);
    trackCutoff(cutoffByKey, keyOf(naturalKey), parseRcrCutoffSeconds(rcr.rcrCutoff));
  }
}

function summaryFromAggregate(
  agg: DogAggregate,
  avgCutoffSeconds: number | null
): DogRacePointSummary {
  const title = earnedTitleFor(agg);
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

/** Aggregated dog race points for the public Dog Race Points page. */
export async function computeDogRacePointSummaries(): Promise<DogRacePointSummary[]> {
  const registry = await loadRegistryDogs();
  const { points, rcrPoints } = await loadAggregationInputs();
  const { resolveKey } = buildKeyResolver(registry, points, rcrPoints);

  const aggregates = aggregateDogPoints(points, rcrPoints, resolveKey);

  const cutoffByKey = new Map<string, { sum: number; count: number }>();
  applyCutoffTracking(points, rcrPoints, resolveKey, cutoffByKey);

  const summaries = Array.from(aggregates.values())
    .filter(
      (agg) =>
        agg.displayName &&
        agg.displayName.trim() !== "" &&
        agg.displayName.toLowerCase() !== "n/a"
    )
    .map((agg) => {
      const cutoff = cutoffByKey.get(agg.key);
      const avgCutoffSeconds =
        cutoff && cutoff.count > 0 ? cutoff.sum / cutoff.count : null;
      return summaryFromAggregate(agg, avgCutoffSeconds);
    });

  summaries.sort((a, b) => {
    const aTotal = a.pointsWithinCutoff + a.pointsOutsideCutoff;
    const bTotal = b.pointsWithinCutoff + b.pointsOutsideCutoff;
    return bTotal - aTotal;
  });

  return summaries;
}
