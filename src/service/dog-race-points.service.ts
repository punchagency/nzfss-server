import {
  aggregateDogPoints,
  findAmbiguousRcrDogIds,
  findAmbiguousPetNames,
  getLiveDogMergeKey,
  getRcrMergeKey,
  timeToSeconds,
  type AggDogPoint,
  type AggPoint,
  type AggRcrPoint,
  type DogAggregate,
  type KeyResolver,
} from "../utils/dog-points-aggregation";
import {
  buildKeyResolver,
  earnedTitleFor,
  loadAggregationInputs,
  loadRegistryDogs,
} from "./dog-title.service";
import { RefreshingCache } from "../utils/refreshing-cache";
import { isNonScoringClass } from "../utils/class-eligibility";

export interface DogRacePointSummary {
  name: string;
  regNumber: string;
  breed: string;
  pointsWithinCutoff: number;
  pointsOutsideCutoff: number;
  events: number;
  cutoffPoints: number;
  awards: string;
}

/** Historical RCR imports store total cutoff point counts as integers (not times). */
export function parseRcrCutoffPoints(rcrCutoff?: string | number | null): number {
  if (rcrCutoff === null || rcrCutoff === undefined || rcrCutoff === "") return 0;

  if (typeof rcrCutoff === "number") {
    return rcrCutoff >= 0 && Number.isInteger(rcrCutoff) ? rcrCutoff : 0;
  }

  const trimmed = rcrCutoff.trim();
  if (!trimmed) return 0;
  if (/^\d{1,2}:\d{2}:\d{2}/.test(trimmed)) return 0;

  const numericValue = Number(trimmed);
  if (!Number.isFinite(numericValue) || numericValue < 0) return 0;
  return Number.isInteger(numericValue) ? numericValue : Math.floor(numericValue);
}

function liveCutoffPointsForRace(
  point: AggPoint,
  dogPoint: AggDogPoint | undefined,
  entrant: NonNullable<AggPoint["entrant"]>
): number {
  if (typeof dogPoint?.cutoffPoints === "number" && !Number.isNaN(dogPoint.cutoffPoints)) {
    return dogPoint.cutoffPoints;
  }

  const storedCutoff = timeToSeconds(point.cutoffTime);
  const raceTime = timeToSeconds(entrant.raceTime);
  if (storedCutoff >= Number.MAX_VALUE || raceTime >= Number.MAX_VALUE) return 0;

  return raceTime > storedCutoff ? 1 : 0;
}

/** @internal Exported for unit tests */
export function applyCutoffTracking(
  points: AggPoint[],
  rcrPoints: AggRcrPoint[],
  resolveKey: KeyResolver,
  cutoffByKey: Map<string, number>
): void {
  const keyOf = (naturalKey: string): string =>
    (resolveKey && resolveKey(naturalKey)) || naturalKey;
  const ambiguousRcrDogIds = findAmbiguousRcrDogIds(rcrPoints);
  const ambiguousPetNames = findAmbiguousPetNames(rcrPoints);

  for (const rcr of rcrPoints) {
    const name = rcr.rcrPedigreeName;
    if (!name || name.trim() === "" || name.toLowerCase() === "n/a") continue;

    const historicalCutoffPoints = parseRcrCutoffPoints(rcr.rcrCutoff);
    if (historicalCutoffPoints <= 0) continue;

    const naturalKey = getRcrMergeKey(rcr, ambiguousRcrDogIds, ambiguousPetNames);
    const key = keyOf(naturalKey);
    cutoffByKey.set(key, (cutoffByKey.get(key) || 0) + historicalCutoffPoints);
  }

  for (const point of points) {
    const entrant = point.entrant;
    if (!entrant || !Array.isArray(entrant.associatedDog) || entrant.associatedDog.length === 0) {
      continue;
    }
    // Non-scoring classes contribute no cutoff points, same as they contribute no points.
    if (isNonScoringClass(entrant)) continue;

    for (const dog of entrant.associatedDog) {
      const naturalKey = getLiveDogMergeKey(dog, ambiguousRcrDogIds, ambiguousPetNames);
      const key = keyOf(naturalKey);

      const dogPoint = point.dogPoints?.find(
        (dp) =>
          (dog.dogId && dp.dogId === dog.dogId) ||
          dp.NZFSSRegistration === dog.NZFSSRegistration
      );

      const raceCutoffPoints = liveCutoffPointsForRace(point, dogPoint, entrant);
      if (raceCutoffPoints <= 0) continue;

      cutoffByKey.set(key, (cutoffByKey.get(key) || 0) + raceCutoffPoints);
    }
  }
}

/** @internal Exported for unit tests */
export function getCutoffPointsForKey(
  cutoffByKey: Map<string, number>,
  key: string
): number {
  return cutoffByKey.get(key) || 0;
}

function summaryFromAggregate(
  agg: DogAggregate,
  cutoffPoints: number
): DogRacePointSummary {
  const title = earnedTitleFor(agg);
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

async function buildDogRacePointSummaries(): Promise<DogRacePointSummary[]> {
  const [registry, { points, rcrPoints }] = await Promise.all([
    loadRegistryDogs(),
    loadAggregationInputs(),
  ]);
  const { resolveKey } = buildKeyResolver(registry, points, rcrPoints);

  const aggregates = aggregateDogPoints(points, rcrPoints, resolveKey);

  const cutoffByKey = new Map<string, number>();
  applyCutoffTracking(points, rcrPoints, resolveKey, cutoffByKey);

  const summaries = Array.from(aggregates.values())
    .filter(
      (agg) =>
        agg.displayName &&
        agg.displayName.trim() !== "" &&
        agg.displayName.toLowerCase() !== "n/a"
    )
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

const SUMMARY_TTL_MS = 5 * 60 * 1000;

const summaryCache = new RefreshingCache(buildDogRacePointSummaries, SUMMARY_TTL_MS);

/**
 * Aggregated dog race points for the public Dog Race Points page.
 *
 * Reads whole collections, so the result is cached; call
 * {@link invalidateDogRacePointSummaries} after anything that changes points.
 */
export async function computeDogRacePointSummaries(): Promise<DogRacePointSummary[]> {
  return summaryCache.get();
}

/** Drops the cached summaries so the next page load recomputes them. */
export function invalidateDogRacePointSummaries(): void {
  summaryCache.invalidate();
}
