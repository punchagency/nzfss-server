import {
  assertUniqueDogIds,
  buildDogLookup,
  findExistingDog,
  generateDogId,
  isValidDogId,
  resolveDogId,
} from "./dog-id";

export interface DogTitleRecognitionFields {
  sd?: boolean;
  sdx?: boolean;
  sdCh?: boolean;
}

export interface ProcessedMusherDog {
  dogId: string;
  name: string;
  pedigreeName: string;
  nzkcNo: string;
  nzfssNo: string;
  dateOfBirth: string;
  breed: string;
  deceased: boolean;
  titleRecognition?: DogTitleRecognitionFields;
}

export interface MusherDogInputFields {
  _id?: string;
  dogId?: string;
  name?: string;
  pedigreeName?: string;
  nzkcNo?: string;
  nzfssNo?: string;
  dob?: string;
  dateOfBirth?: string;
  breed?: string;
  deceased?: boolean;
  titleRecognition?: DogTitleRecognitionFields;
}

export interface ExistingMusherDogFields extends MusherDogInputFields {
  dogId?: string;
}

function normalizeTitleRecognition(
  flags?: DogTitleRecognitionFields
): DogTitleRecognitionFields | undefined {
  if (!flags) return undefined;
  return {
    sd: Boolean(flags.sd),
    sdx: Boolean(flags.sdx),
    sdCh: Boolean(flags.sdCh),
  };
}

function toProcessedDog(
  dogId: string,
  dog: MusherDogInputFields,
  existing?: ExistingMusherDogFields
): ProcessedMusherDog {
  // Title recognition is managed by the recognition workflow, not the musher
  // edit form. Preserve the existing flags unless the input explicitly sets them.
  const titleRecognition = normalizeTitleRecognition(
    dog.titleRecognition ?? existing?.titleRecognition
  );

  return {
    dogId,
    name: dog.name || "",
    pedigreeName: dog.pedigreeName || "",
    nzkcNo: dog.nzkcNo || "",
    nzfssNo: dog.nzfssNo || "",
    dateOfBirth: dog.dob || dog.dateOfBirth || "",
    breed: dog.breed || "",
    deceased: Boolean(dog.deceased),
    ...(titleRecognition ? { titleRecognition } : {}),
  };
}

/** Assign dogIds for new mushers (no existing dogs). */
export function processDogsForCreate(
  dogs: MusherDogInputFields[]
): ProcessedMusherDog[] {
  const processed = dogs.map((dog) => {
    const dogId = resolveDogId(dog);
    return toProcessedDog(dogId, dog);
  });
  assertUniqueDogIds(processed, "createMusher");
  return processed;
}

/**
 * Merge incoming dogs with existing records by dogId (preferred),
 * then nzfssNo, then pet name. Preserves immutable dogId on updates.
 */
export function processDogsForUpdate(
  inputDogs: MusherDogInputFields[],
  existingDogs: ExistingMusherDogFields[] = []
): ProcessedMusherDog[] {
  const lookup = buildDogLookup(existingDogs);

  const processed = inputDogs.map((dog) => {
    const existing = findExistingDog(dog, lookup);
    const dogId = resolveDogId(dog, existing);
    return toProcessedDog(dogId, dog, existing);
  });

  assertUniqueDogIds(processed, "updateMusher");
  return processed;
}

/** Backfill dogId on stored dogs missing one (migration / read repair). */
export function ensureDogIdsOnStoredDogs(
  dogs: ExistingMusherDogFields[]
): ProcessedMusherDog[] {
  const usedIds = new Set<string>();

  return dogs.map((dog) => {
    let dogId = dog.dogId;
    if (!isValidDogId(dogId)) {
      dogId = generateDogId();
    }
    while (usedIds.has(dogId)) {
      dogId = generateDogId();
    }
    usedIds.add(dogId);
    return toProcessedDog(dogId, dog, dog);
  });
}
