import { randomUUID } from "crypto";

/** UUID v4 format — stable, immutable dog identifier */
export const DOG_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function generateDogId(): string {
  return randomUUID();
}

export function isValidDogId(id: string | undefined | null): id is string {
  return typeof id === "string" && DOG_ID_REGEX.test(id);
}

export interface DogIdInput {
  _id?: string;
  dogId?: string;
}

export interface ExistingDogRef {
  dogId?: string;
}

/**
 * Resolves a stable dogId from input or existing record.
 * Never overwrites an existing valid dogId.
 */
export function resolveDogId(
  input: DogIdInput,
  existing?: ExistingDogRef
): string {
  if (input.dogId && isValidDogId(input.dogId)) return input.dogId;
  if (input._id && isValidDogId(input._id)) return input._id;
  if (existing?.dogId && isValidDogId(existing.dogId)) return existing.dogId;
  return generateDogId();
}

export interface DogLookupFields {
  dogId?: string;
  name?: string;
  nzfssNo?: string;
  nzfssNumber?: string;
  petName?: string;
}

export function buildDogLookup<T extends DogLookupFields>(dogs: T[]) {
  const byDogId = new Map<string, T>();
  const byNzfss = new Map<string, T>();
  const byName = new Map<string, T>();

  for (const dog of dogs) {
    if (dog.dogId && isValidDogId(dog.dogId)) {
      byDogId.set(dog.dogId, dog);
    }
    const nzfss = (dog.nzfssNo || dog.nzfssNumber || "").trim().toLowerCase();
    if (nzfss) byNzfss.set(nzfss, dog);
    const name = (dog.name || dog.petName || "").trim().toLowerCase();
    if (name) byName.set(name, dog);
  }

  return { byDogId, byNzfss, byName };
}

export function findExistingDog<T extends DogLookupFields>(
  input: {
    _id?: string;
    dogId?: string;
    name?: string;
    nzfssNo?: string;
    nzfssNumber?: string;
    petName?: string;
  },
  lookup: ReturnType<typeof buildDogLookup<T>>
): T | undefined {
  const id = input.dogId || input._id;
  if (id && lookup.byDogId.has(id)) return lookup.byDogId.get(id);

  const nzfss = (input.nzfssNo || input.nzfssNumber || "").trim().toLowerCase();
  if (nzfss && lookup.byNzfss.has(nzfss)) return lookup.byNzfss.get(nzfss);

  const name = (input.name || input.petName || "").trim().toLowerCase();
  if (name && lookup.byName.has(name)) return lookup.byName.get(name);

  return undefined;
}

/**
 * Ensures every dog in the array has a unique, valid dogId.
 * Throws if duplicate dogIds are detected within the array.
 */
export function assertUniqueDogIds(
  dogs: Array<{ dogId?: string }>,
  context: string
): void {
  const seen = new Set<string>();
  for (const dog of dogs) {
    if (!dog.dogId || !isValidDogId(dog.dogId)) continue;
    if (seen.has(dog.dogId)) {
      throw new Error(`Duplicate dogId "${dog.dogId}" in ${context}`);
    }
    seen.add(dog.dogId);
  }
}
