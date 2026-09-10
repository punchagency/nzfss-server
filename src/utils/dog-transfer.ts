/**
 * Moving a single dog from one musher to another.
 *
 * Dogs live as embedded subdocuments on `Musher.dogs[]`, each carrying an
 * immutable `dogId` and its `nzfssNo`. Race results reference a dog by that
 * registration / dogId rather than by its musher, so relocating the subdocument
 * leaves all race history intact — the dog simply appears under a new owner.
 *
 * This module is the pure planning step: given the source and destination dog
 * arrays and a selector for the dog to move, it returns the two new arrays
 * without touching the database. Executing the plan (loading, saving the two
 * mushers) is the caller's job. Keeping it pure makes the tricky parts —
 * finding the right dog, not duplicating it on the destination — unit testable.
 */
import { buildDogLookup, findExistingDog } from "./dog-id";

export interface TransferDog {
  dogId?: string;
  name?: string;
  nzfssNo?: string;
  pedigreeName?: string;
  nzkcNo?: string;
  dateOfBirth?: string;
  breed?: string;
  deceased?: boolean;
  titleRecognition?: unknown;
}

/** How the caller points at the dog to move: dogId first, then registration, then name. */
export interface DogSelector {
  dogId?: string;
  nzfssNo?: string;
  name?: string;
}

export interface DogTransferPlan<T extends TransferDog> {
  /** Source musher's dogs with the moved dog removed. */
  sourceDogs: T[];
  /** Destination musher's dogs with the moved dog appended (deduped). */
  destinationDogs: T[];
  /** The dog subdocument that moved. */
  movedDog: T;
}

/** Locate a dog within an array by dogId, then registration, then name. */
export function findDogInList<T extends TransferDog>(
  dogs: T[],
  selector: DogSelector
): T | undefined {
  return findExistingDog(selector, buildDogLookup(dogs));
}

/**
 * Plan a dog move. Throws if the dog is not on the source musher. If the
 * destination musher already holds the same dog (same dogId or registration)
 * the stale copy is replaced by the moved subdocument rather than duplicated.
 */
export function planDogTransfer<T extends TransferDog>(
  sourceDogs: T[] | undefined,
  destinationDogs: T[] | undefined,
  selector: DogSelector
): DogTransferPlan<T> {
  const source = [...(sourceDogs || [])];
  const destination = [...(destinationDogs || [])];

  const movedDog = findDogInList(source, selector);
  if (!movedDog) {
    throw new Error("Dog not found on the source musher");
  }

  const remainingSource = source.filter((dog) => dog !== movedDog);

  // Drop any existing copy of this dog on the destination so it is not listed twice.
  const existingOnDestination = findExistingDog(movedDog, buildDogLookup(destination));
  const dedupedDestination = existingOnDestination
    ? destination.filter((dog) => dog !== existingOnDestination)
    : destination;

  return {
    sourceDogs: remainingSource,
    destinationDogs: [...dedupedDestination, movedDog],
    movedDog,
  };
}
