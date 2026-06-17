import { MusherModel } from "../models/musher.model";
import { PointModel } from "../schema/point.schema";
import { EntrantModel } from "../schema/entrants.schema";
import { RcrPointsModel } from "../schema/rcrpoints.schema";
import { isValidDogId } from "../utils/dog-id";
import {
  aggregateDogPoints,
  getDogMergeKey,
  findAmbiguousRcrDogIds,
  getRcrMergeKey,
  parseRegistration,
  type AggPoint,
  type AggRcrPoint,
  type DogAggregate,
  type KeyResolver,
} from "../utils/dog-points-aggregation";
import {
  determineTitle,
  positionCreditsFor,
  titleRank,
  highestRecognisedTitle,
  isUnrecognisedTitleChange,
  achievedTitlesUpTo,
  recognitionKey,
  TITLE_LABELS,
  type TitleCode,
  type TitleRecognitionFlags,
} from "../utils/dog-titles";

interface RegistryDog {
  musherId: string;
  ownerName: string;
  dogId: string;
  name: string;
  pedigreeName: string;
  nzfssNo: string;
  breed: string;
  flags: TitleRecognitionFlags;
}

export interface DogTitleStatus {
  registryDog: RegistryDog;
  aggregate?: DogAggregate;
  earnedTitle: TitleCode | null;
  recognisedTitle: TitleCode | null;
  isUnrecognised: boolean;
}

/** Parse a historical award string (e.g. "SDCh", "SDX") into a title code. */
export function parseTitleFromAwards(awards?: string): TitleCode | null {
  const value = (awards || "").toLowerCase();
  if (!value) return null;
  if (value.includes("sdch")) return "SDCh";
  if (value.includes("sdx")) return "SDX";
  if (/\bsd\b/.test(value) || value.includes("sled dog")) return "SD";
  return null;
}

function canonicalKey(dogId: string): string {
  return `id:${dogId.trim().toLowerCase()}`;
}

export async function loadRegistryDogs(): Promise<RegistryDog[]> {
  const mushers = await MusherModel.find().lean();
  const registry: RegistryDog[] = [];

  for (const musher of mushers) {
    const dogs = (musher.dogs || []) as Array<Record<string, any>>;
    for (const dog of dogs) {
      if (!isValidDogId(dog.dogId)) continue;
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

/**
 * Builds a resolver that folds point/RCR records onto a registry dog's
 * canonical key (by dogId, or by registration+pet-name when unambiguous).
 */
function registryLabelKeys(dog: RegistryDog): string[] {
  const keys = new Set<string>();
  const { kennelReg } = parseRegistration(dog.nzfssNo);
  const hasPetSuffix = Boolean(parseRegistration(dog.nzfssNo).petNameFromReg);

  for (const label of [dog.name, dog.pedigreeName]) {
    if (!label?.trim()) continue;
    keys.add(getDogMergeKey({ name: label, registration: dog.nzfssNo }));
    // RCR imports often use kennel-level reg only (e.g. RR/098 vs RR/098/AMOS)
    if (hasPetSuffix && kennelReg) {
      keys.add(getDogMergeKey({ name: label, registration: kennelReg }));
    }
  }
  return [...keys];
}

export function buildKeyResolver(
  registry: RegistryDog[],
  points?: AggPoint[],
  rcrPoints?: AggRcrPoint[]
): {
  resolveKey: KeyResolver;
  byCanonical: Map<string, RegistryDog>;
} {
  const byCanonical = new Map<string, RegistryDog>();
  const map = new Map<string, string>();
  const regKeyToDogIds = new Map<string, Set<string>>();

  for (const dog of registry) {
    const canonical = canonicalKey(dog.dogId);
    byCanonical.set(canonical, dog);
    map.set(canonical, canonical);
    map.set(`id:${dog.dogId.toLowerCase()}`, canonical);

    for (const regKey of registryLabelKeys(dog)) {
      if (!regKeyToDogIds.has(regKey)) regKeyToDogIds.set(regKey, new Set());
      regKeyToDogIds.get(regKey)!.add(dog.dogId);
    }
  }

  for (const [regKey, dogIds] of regKeyToDogIds) {
    if (dogIds.size === 1) {
      map.set(regKey, canonicalKey([...dogIds][0]));
    }
  }

  const ambiguousRcrDogIds = findAmbiguousRcrDogIds(rcrPoints || []);

  // Map unregistered dogIds from points to registry dogIds if their registration key matches
  if (points) {
    for (const point of points) {
      const entrant = point.entrant;
      if (entrant && Array.isArray(entrant.associatedDog)) {
        for (const dog of entrant.associatedDog) {
          const regKeyOnly = getDogMergeKey({
            name: dog.name,
            registration: dog.NZFSSRegistration,
          });
          const dogId = dog.dogId?.trim().toLowerCase();
          if (!dogId || ambiguousRcrDogIds.has(dogId)) continue;

          const canonicalId = `id:${dogId}`;
          if (byCanonical.has(canonicalId)) {
            // Fold reg+name keys onto this registry dog (links RCR rows to live dogId)
            map.set(regKeyOnly, canonicalId);
          } else {
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
      if (!rcrDogId || ambiguousRcrDogIds.has(rcrDogId)) continue;

      const canonicalId = `id:${rcrDogId}`;
      if (!byCanonical.has(canonicalId)) {
        const regKey = getRcrMergeKey(rcr, ambiguousRcrDogIds);
        const registryId = map.get(regKey);
        if (registryId) {
          map.set(canonicalId, registryId);
        }
      }
    }
  }

  const resolveKey: KeyResolver = (naturalKey) => map.get(naturalKey);
  return { resolveKey, byCanonical };
}

export async function loadAggregationInputs(): Promise<{
  points: AggPoint[];
  rcrPoints: AggRcrPoint[];
}> {
  const points = await PointModel.find({}).lean();
  const entrantIds = points.map((p) => p.entrantId);
  const entrants = await EntrantModel.find({ _id: { $in: entrantIds } }).lean();

  const entrantMap = new Map<string, any>();
  entrants.forEach((e) => entrantMap.set(e._id.toString(), e));

  const aggPoints: AggPoint[] = points.map((p) => {
    const entrant = entrantMap.get(p.entrantId.toString());
    return {
      points: p.points,
      cutoffTime: p.cutoffTime || null,
      dogPoints: (p.dogPoints || []) as AggPoint["dogPoints"],
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

  const rcrRows = await RcrPointsModel.find({}).lean();
  const rcrPoints: AggRcrPoint[] = rcrRows.map((r) => ({
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

/** Highest title a dog has earned, honouring historical awards as a floor. */
export function earnedTitleFor(aggregate?: DogAggregate): TitleCode | null {
  if (!aggregate) return null;
  const calculated = determineTitle({
    pointsWithinCutoff: aggregate.pointsWithinCutoff,
    totalPoints: aggregate.pointsWithinCutoff + aggregate.pointsOutsideCutoff,
    positionCredits: positionCreditsFor(aggregate.positions),
  });
  const historical = parseTitleFromAwards(aggregate.historicalAwards);

  if (titleRank(historical) > titleRank(calculated)) return historical;
  return calculated;
}

/** Computes title status for every registry dog. */
export async function computeDogTitleStatuses(): Promise<DogTitleStatus[]> {
  const registry = await loadRegistryDogs();
  const { points, rcrPoints } = await loadAggregationInputs();
  const { resolveKey, byCanonical } = buildKeyResolver(registry, points, rcrPoints);

  const aggregates = aggregateDogPoints(points, rcrPoints, resolveKey);

  const statuses: DogTitleStatus[] = [];
  for (const [canonical, registryDog] of byCanonical) {
    const aggregate = aggregates.get(canonical);
    const earnedTitle = earnedTitleFor(aggregate);
    const recognisedTitle = highestRecognisedTitle(registryDog.flags);
    statuses.push({
      registryDog,
      aggregate,
      earnedTitle,
      recognisedTitle,
      isUnrecognised: isUnrecognisedTitleChange(earnedTitle, registryDog.flags),
    });
  }

  return statuses;
}

export interface UnrecognisedChange {
  dogId: string;
  musherId: string;
  dogName: string;
  pedigreeName: string;
  nzfssNo: string;
  ownerName: string;
  breed: string;
  previousTitle: string;
  newTitle: string;
  previousTitleCode: string | null;
  newTitleCode: string;
  points: number;
  events: number;
}

export async function getUnrecognisedTitleChanges(): Promise<UnrecognisedChange[]> {
  const statuses = await computeDogTitleStatuses();

  return statuses
    .filter((s) => s.isUnrecognised && s.earnedTitle)
    .map((s) => {
      const points =
        (s.aggregate?.pointsWithinCutoff || 0) + (s.aggregate?.pointsOutsideCutoff || 0);
      return {
        dogId: s.registryDog.dogId,
        musherId: s.registryDog.musherId,
        dogName: s.registryDog.name,
        pedigreeName: s.registryDog.pedigreeName,
        nzfssNo: s.registryDog.nzfssNo,
        ownerName: s.registryDog.ownerName,
        breed: s.registryDog.breed,
        previousTitle: s.recognisedTitle ? TITLE_LABELS[s.recognisedTitle] : "None",
        newTitle: TITLE_LABELS[s.earnedTitle as TitleCode],
        previousTitleCode: s.recognisedTitle,
        newTitleCode: s.earnedTitle as TitleCode,
        points: Math.round(points * 10) / 10,
        events: s.aggregate?.events || 0,
      };
    })
    .sort((a, b) => a.ownerName.localeCompare(b.ownerName) || a.dogName.localeCompare(b.dogName));
}

/**
 * Recognises (issues certificates for) the highest earned title for each dog.
 * Sets recognised flags for every achieved level, and is idempotent — already
 * recognised dogs are skipped so titles are never recognised twice.
 */
export async function recogniseTitleChanges(dogIds: string[]): Promise<number> {
  const uniqueIds = Array.from(new Set(dogIds.filter((id) => isValidDogId(id))));
  if (uniqueIds.length === 0) return 0;

  const statuses = await computeDogTitleStatuses();
  const statusByDogId = new Map(statuses.map((s) => [s.registryDog.dogId, s]));

  let recognisedCount = 0;

  for (const dogId of uniqueIds) {
    const status = statusByDogId.get(dogId);
    if (!status || !status.earnedTitle) continue;
    if (!status.isUnrecognised) continue; // already recognised — prevent duplicates

    const achieved = achievedTitlesUpTo(status.earnedTitle);
    const setFields: Record<string, boolean> = {};
    (Object.keys(achieved) as TitleCode[]).forEach((title) => {
      if (achieved[title]) {
        setFields[`dogs.$.titleRecognition.${recognitionKey(title)}`] = true;
      }
    });

    const result = await MusherModel.updateOne(
      { _id: status.registryDog.musherId, "dogs.dogId": dogId },
      { $set: setFields }
    );

    if (result.modifiedCount && result.modifiedCount > 0) recognisedCount++;
  }

  return recognisedCount;
}
