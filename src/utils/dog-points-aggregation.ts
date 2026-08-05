/**
 * Server-side dog race-points aggregation.
 *
 * Mirrors the client logic in
 * `nzfss-client-main/app/(routes)/dog-race-point/page.tsx` (getDogMergeKey,
 * mergeRcrData, the live points loop) so server-calculated titles match the
 * public Dog Race Points page. Adds finishing-position tracking (1st/2nd/3rd),
 * which the title (SDCh) rule depends on.
 */

import { isNonScoringClass } from "./class-eligibility";

export interface DogSnapshot {
  dogId?: string;
  name?: string;
  NZFSSRegistration?: string;
  breed?: string;
  driverName?: string;
}

export interface AggEntrant {
  raceTime?: string | null;
  class?: string;
  customClass?: string;
  eventId?: string;
  raceType?: string;
  associatedDog: DogSnapshot[];
}

export interface AggDogPoint {
  dogId?: string;
  NZFSSRegistration?: string;
  points: number;
  cutoffPoints?: number;
}

export interface AggPoint {
  points: number;
  cutoffTime?: string | null;
  dogPoints?: AggDogPoint[];
  entrant?: AggEntrant | null;
}

export interface AggRcrPoint {
  dogId?: string;
  rcrReg?: string;
  rcrFlag?: string;
  rcrPedigreeName?: string;
  rcrBreed?: string;
  rcrPoints?: number;
  rcrEvents?: number;
  rcrAwards?: string;
  rcrCutoff?: string;
}

export interface DogAggregate {
  key: string;
  dogId?: string;
  petName: string;
  displayName: string;
  kennelReg: string;
  breed?: string;
  pointsWithinCutoff: number;
  pointsOutsideCutoff: number;
  events: number;
  positions: { first: number; second: number; third: number };
  /** Historical award string (e.g. from RCR import); used as a title floor. */
  historicalAwards: string;
}

export function parseRegistration(reg?: string | null): {
  kennelReg: string;
  petNameFromReg?: string;
} {
  if (!reg || !reg.includes("/")) {
    return { kennelReg: (reg || "").trim() };
  }
  const parts = reg.split("/");
  if (parts.length >= 3) {
    return {
      kennelReg: parts.slice(0, -1).join("/").trim(),
      petNameFromReg: parts[parts.length - 1].trim(),
    };
  }
  return { kennelReg: reg.trim() };
}

export function normalizeKennelReg(reg?: string | null): string {
  return parseRegistration(reg).kennelReg.toLowerCase();
}

/** Full pedigree name, normalised. Used when a short pet name is ambiguous. */
function normalizeFullName(workingName: string): string {
  return workingName.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Derives the pet name used to merge records for the same dog.
 *
 * Several steps deliberately shorten a pedigree name to a single word (e.g.
 * "Natomah Skoahls Amos" -> "amos") so RCR imports merge with live entries that
 * only carry a call name. That shortening is lossy: within one kennel,
 * "Black Magic of Carob" and "German Son of Carob" both reduce to "carob".
 *
 * @param ambiguousPetNames keys ("<kennelReg>|<petName>") that more than one
 *   pedigree name reduces to. For those the full name is used instead, so two
 *   different dogs never share a merge key. Build it with
 *   {@link findAmbiguousPetNames}.
 */
export function extractPetName(
  name?: string | null,
  registration?: string | null,
  ambiguousPetNames?: Set<string>
): string {
  const { petNameFromReg } = parseRegistration(registration);
  if (petNameFromReg) return petNameFromReg.toLowerCase();

  const trimmed = (name || "").trim();
  if (!trimmed) return "unknown";

  // Clean trailing title suffixes (like SD, SDX, SDCh, SDCH, AD, RN, WLD, WTD, WSD) and parentheses (like (Imp Aus))
  let cleaned = trimmed;
  const titleRegex = /[,]?\s+\b(sdch|sdx|sd|ad|rn|wld|wtd|wsd)\b/gi;
  const parenRegex = /\s*\([^)]*\)\s*$/g;
  let previous;
  do {
    previous = cleaned;
    cleaned = cleaned.replace(titleRegex, "").trim();
    cleaned = cleaned.replace(parenRegex, "").trim();
  } while (cleaned !== previous);

  const workingName = cleaned || trimmed;

  // Every shortening below drops part of the name, so two dogs in one kennel can
  // land on the same word. When that is known to happen, keep the full name.
  const shortened = (petName: string): string =>
    ambiguousPetNames?.has(`${normalizeKennelReg(registration)}|${petName}`)
      ? normalizeFullName(workingName)
      : petName;

  // "Nalbec's Finn" -> "finn", "Nalbec's Spirit of X" -> "spirit"
  const possessive = workingName.match(/'s\s+(.+)$/i);
  if (possessive) {
    const petPart = possessive[1].trim();
    const ofMatch = petPart.match(/^(\S+)\s+of\s+/i);
    if (ofMatch) return shortened(ofMatch[1].toLowerCase());
    return shortened(petPart.split(/\s+/)[0].toLowerCase());
  }

  // "Howling Spirits Rita at Nalbec" -> "rita", "Pawtrax Indys Dude by Kol" -> "dude"
  if (/\s+(at|by)\s+/i.test(workingName)) {
    const beforeAtOrBy = workingName.split(/\s+(at|by)\s+/i)[0].trim();
    const words = beforeAtOrBy.split(/\s+/);
    return shortened(words[words.length - 1].toLowerCase());
  }

  const ofKennelMatch = workingName.match(/^(\S+)\s+of\s+/i);
  if (ofKennelMatch) return shortened(ofKennelMatch[1].toLowerCase());

  // "Natomah Skoahls Amos" + kennel reg RR/098 -> "amos" (RCR often has no pet suffix on reg)
  const { kennelReg, petNameFromReg: regHasPetSuffix } = parseRegistration(registration);
  const words = workingName.split(/\s+/).filter(Boolean);
  if (words.length > 1 && kennelReg && !regHasPetSuffix) {
    return shortened(words[words.length - 1].toLowerCase());
  }

  return normalizeFullName(workingName);
}

/**
 * Finds pet names that more than one pedigree name reduces to within the same
 * kennel registration (e.g. "Black Magic of Carob" and "German Son of Carob"
 * both reduce to "carob" under RR-style kennel-level regs).
 *
 * Returns keys of the form "<kennelReg>|<petName>".
 */
export function findAmbiguousPetNames(rcrPoints: AggRcrPoint[]): Set<string> {
  const namesByKey = new Map<string, Set<string>>();

  for (const rcr of rcrPoints) {
    const name = rcr.rcrPedigreeName?.trim();
    if (!name || name.toLowerCase() === "n/a") continue;

    const registration = rcr.rcrReg || rcr.rcrFlag;
    const key = `${normalizeKennelReg(registration)}|${extractPetName(name, registration)}`;

    if (!namesByKey.has(key)) namesByKey.set(key, new Set());
    namesByKey.get(key)!.add(name.toLowerCase());
  }

  const ambiguous = new Set<string>();
  for (const [key, names] of namesByKey) {
    if (names.size > 1) ambiguous.add(key);
  }
  return ambiguous;
}

export function getDogMergeKey(params: {
  dogId?: string | null;
  name?: string | null;
  registration?: string | null;
  ambiguousPetNames?: Set<string>;
}): string {
  if (params.dogId && params.dogId.trim()) {
    return `id:${params.dogId.trim().toLowerCase()}`;
  }
  const kennelReg = normalizeKennelReg(params.registration);
  const petName = extractPetName(
    params.name,
    params.registration,
    params.ambiguousPetNames
  );
  return `reg:${kennelReg}|${petName}`;
}

/**
 * RCR imports often share a kennel-level registration (e.g. RR/098) while a
 * migration may have assigned the same dogId to every row. Those dogIds must
 * not drive merge keys or unrelated dogs collapse into one record.
 */
export function findAmbiguousRcrDogIds(rcrPoints: AggRcrPoint[]): Set<string> {
  const namesByDogId = new Map<string, Set<string>>();

  for (const rcr of rcrPoints) {
    const dogId = rcr.dogId?.trim().toLowerCase();
    const name = rcr.rcrPedigreeName?.trim().toLowerCase();
    if (!dogId || !name || name === "n/a") continue;

    if (!namesByDogId.has(dogId)) namesByDogId.set(dogId, new Set());
    namesByDogId.get(dogId)!.add(name);
  }

  const ambiguous = new Set<string>();
  for (const [dogId, names] of namesByDogId) {
    if (names.size > 1) ambiguous.add(dogId);
  }
  return ambiguous;
}

export function getRcrMergeKey(
  rcr: AggRcrPoint,
  ambiguousDogIds: Set<string>,
  ambiguousPetNames?: Set<string>
): string {
  const name = rcr.rcrPedigreeName;
  const regValue = rcr.rcrReg || rcr.rcrFlag;
  const dogId = rcr.dogId?.trim().toLowerCase();
  const useDogId = dogId && !ambiguousDogIds.has(dogId) ? rcr.dogId : undefined;

  return getDogMergeKey({
    dogId: useDogId,
    name,
    registration: regValue,
    ambiguousPetNames,
  });
}

/** Live race entries may carry the same bad shared dogId as RCR imports. */
export function getLiveDogMergeKey(
  dog: DogSnapshot,
  ambiguousDogIds: Set<string>,
  ambiguousPetNames?: Set<string>
): string {
  const dogId = dog.dogId?.trim().toLowerCase();
  const useDogId =
    dogId && !ambiguousDogIds.has(dogId) ? dog.dogId : undefined;

  return getDogMergeKey({
    dogId: useDogId,
    name: dog.name,
    registration: dog.NZFSSRegistration,
    ambiguousPetNames,
  });
}

export function timeToSeconds(timeStr?: string | null): number {
  if (!timeStr || !/^\d{1,2}:\d{2}:\d{2}(\.\d+)?$/.test(timeStr)) {
    return Number.MAX_VALUE;
  }
  const [h, m, s] = timeStr.split(":");
  const hours = parseInt(h || "0", 10);
  const minutes = parseInt(m || "0", 10);
  const seconds = parseFloat(s || "0");
  return hours * 3600 + minutes * 60 + seconds;
}

function hasValidFinish(raceType?: string): boolean {
  const status = (raceType || "").toLowerCase();
  return !["did not start", "did not finish", "disqualified", "did not qualify"].includes(status);
}

function pickDisplayName(current: string, candidate: string): string {
  if (!current || current === "Unknown") return candidate;
  if (!candidate) return current;
  const currentIsShortCaps = current === current.toUpperCase() && !current.includes(" ");
  const candidateIsPedigree =
    candidate.includes("'") ||
    (candidate !== candidate.toUpperCase() && candidate.includes(" "));
  if (currentIsShortCaps && candidateIsPedigree) return candidate;
  if (candidate.length > current.length) return candidate;
  return current;
}

/**
 * A function that maps a record's merge key to a canonical key. Used to fold
 * point/RCR records onto a registry dog even when one is keyed by dogId and
 * the other by registration+name.
 */
export type KeyResolver = (mergeKey: string) => string | undefined;

function ensureAggregate(
  map: Map<string, DogAggregate>,
  key: string,
  seed: Partial<DogAggregate>
): DogAggregate {
  let agg = map.get(key);
  if (!agg) {
    agg = {
      key,
      dogId: seed.dogId,
      petName: seed.petName || "unknown",
      displayName: seed.displayName || "Unknown",
      kennelReg: seed.kennelReg || "",
      breed: seed.breed,
      pointsWithinCutoff: 0,
      pointsOutsideCutoff: 0,
      events: 0,
      positions: { first: 0, second: 0, third: 0 },
      historicalAwards: "",
    };
    map.set(key, agg);
  }
  return agg;
}

/**
 * Aggregates per-dog points, events and finishing positions from live race
 * points and historical RCR points.
 *
 * @param resolveKey optional mapper that collapses a record's natural merge key
 *   onto a canonical key (e.g. a registry dog's dogId). When it returns
 *   undefined, the record's own merge key is used.
 */
export function aggregateDogPoints(
  points: AggPoint[],
  rcrPoints: AggRcrPoint[],
  resolveKey?: KeyResolver
): Map<string, DogAggregate> {
  const map = new Map<string, DogAggregate>();
  const ambiguousRcrDogIds = findAmbiguousRcrDogIds(rcrPoints);
  const ambiguousPetNames = findAmbiguousPetNames(rcrPoints);

  const keyOf = (naturalKey: string): string =>
    (resolveKey && resolveKey(naturalKey)) || naturalKey;

  // ----- Finishing positions: rank entrants within (eventId, classKey) -----
  // groupKey -> array of { totalSeconds, dogKeys: canonical keys }
  interface RankRow {
    totalSeconds: number;
    dogKeys: string[];
  }
  const rankGroups = new Map<string, RankRow[]>();

  for (const point of points) {
    const entrant = point.entrant;
    if (!entrant || !Array.isArray(entrant.associatedDog) || entrant.associatedDog.length === 0) {
      continue;
    }
    if (!hasValidFinish(entrant.raceType)) continue;
    // Non-scoring classes award no placing credit toward titles either.
    if (isNonScoringClass(entrant)) continue;
    const secs = timeToSeconds(entrant.raceTime);
    if (secs >= Number.MAX_VALUE) continue;

    const eventId = entrant.eventId || "unknown-event";
    const classKey = `${(entrant.class || "").trim().toLowerCase()}::${(entrant.customClass || "").trim().toLowerCase()}`;
    const groupKey = `${eventId}::${classKey}`;

    const dogKeys = entrant.associatedDog.map((dog) =>
      keyOf(getLiveDogMergeKey(dog, ambiguousRcrDogIds, ambiguousPetNames))
    );

    if (!rankGroups.has(groupKey)) rankGroups.set(groupKey, []);
    rankGroups.get(groupKey)!.push({ totalSeconds: secs, dogKeys });
  }

  // ----- Live points + events -----
  for (const point of points) {
    const entrant = point.entrant;
    if (!entrant || !Array.isArray(entrant.associatedDog) || entrant.associatedDog.length === 0) {
      continue;
    }

    const storedCutoff = timeToSeconds(point.cutoffTime);
    const raceTime = timeToSeconds(entrant.raceTime);
    const isWithinCutoff =
      storedCutoff < Number.MAX_VALUE && raceTime < Number.MAX_VALUE
        ? raceTime <= storedCutoff
        : false;
    // The race still counts as an event the dog ran, but scores nothing.
    const scores = !isNonScoringClass(entrant);

    for (const dog of entrant.associatedDog) {
      const { kennelReg, petNameFromReg } = parseRegistration(dog.NZFSSRegistration);
      const naturalKey = getLiveDogMergeKey(dog, ambiguousRcrDogIds, ambiguousPetNames);
      const key = keyOf(naturalKey);

      const agg = ensureAggregate(map, key, {
        dogId: dog.dogId,
        petName: extractPetName(dog.name, dog.NZFSSRegistration, ambiguousPetNames),
        displayName: dog.name || petNameFromReg || "Unknown",
        kennelReg: kennelReg || dog.NZFSSRegistration || "",
        breed: dog.breed,
      });

      if (!agg.dogId && dog.dogId) agg.dogId = dog.dogId;
      agg.displayName = pickDisplayName(agg.displayName, dog.name || petNameFromReg || "");
      if ((!agg.breed || agg.breed === "Unknown") && dog.breed) agg.breed = dog.breed;

      // Per-dog points: prefer dogPoints[], fall back to musher points / dogCount.
      let dogPointsValue = 0;
      const parsedReg = kennelReg || dog.NZFSSRegistration || "";
      if (!scores) {
        dogPointsValue = 0;
      } else if (Array.isArray(point.dogPoints) && point.dogPoints.length > 0) {
        const entry = point.dogPoints.find(
          (dp) =>
            (dog.dogId && dp.dogId === dog.dogId) ||
            dp.NZFSSRegistration === dog.NZFSSRegistration ||
            dp.NZFSSRegistration === parsedReg
        );
        dogPointsValue = entry
          ? entry.points
          : point.points / entrant.associatedDog.length;
      } else {
        dogPointsValue = point.points / entrant.associatedDog.length;
      }

      if (isWithinCutoff) agg.pointsWithinCutoff += dogPointsValue;
      else agg.pointsOutsideCutoff += dogPointsValue;

      agg.events += 1;
    }
  }

  // ----- Finishing positions applied to aggregates -----
  for (const rows of rankGroups.values()) {
    const sorted = [...rows].sort((a, b) => a.totalSeconds - b.totalSeconds);
    sorted.forEach((row, index) => {
      const place = index + 1;
      if (place > 3) return;
      for (const dogKey of row.dogKeys) {
        const agg = map.get(dogKey);
        if (!agg) continue;
        if (place === 1) agg.positions.first += 1;
        else if (place === 2) agg.positions.second += 1;
        else if (place === 3) agg.positions.third += 1;
      }
    });
  }

  // ----- Historical RCR points -----
  for (const rcr of rcrPoints) {
    const name = rcr.rcrPedigreeName;
    if (!name || name.trim() === "" || name.toLowerCase() === "n/a") continue;

    const regValue = rcr.rcrReg || rcr.rcrFlag;
    const naturalKey = getRcrMergeKey(rcr, ambiguousRcrDogIds, ambiguousPetNames);
    const key = keyOf(naturalKey);
    const { kennelReg, petNameFromReg } = parseRegistration(regValue);
    const trustedDogId =
      rcr.dogId && !ambiguousRcrDogIds.has(rcr.dogId.trim().toLowerCase())
        ? rcr.dogId
        : undefined;

    const agg = ensureAggregate(map, key, {
      dogId: trustedDogId,
      petName: extractPetName(name, regValue, ambiguousPetNames),
      displayName: name || petNameFromReg || "Unknown",
      kennelReg: kennelReg || regValue || "",
      breed: rcr.rcrBreed,
    });

    if (!agg.dogId && trustedDogId) agg.dogId = trustedDogId;
    agg.displayName = pickDisplayName(agg.displayName, name);
    if ((!agg.breed || agg.breed === "Unknown") && rcr.rcrBreed) agg.breed = rcr.rcrBreed;

    // RCR points count toward the within-cutoff bucket (matches client merge).
    agg.pointsWithinCutoff += rcr.rcrPoints || 0;
    agg.events += rcr.rcrEvents || 0;
    if (rcr.rcrAwards && !agg.historicalAwards) agg.historicalAwards = rcr.rcrAwards;
  }

  return map;
}
