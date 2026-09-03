/**
 * Decide when an entrant edit must drop stored points so Save Results
 * asks for a resubmit.
 *
 * Changing dogs, times or finish status leaves championship points pointing
 * at the old team. Heat siblings share one scoring row, so a Heat 2 dog
 * drop has to clear Heat 1's points as well.
 */

export interface ScoringDogLike {
  name?: string | null;
  NZFSSRegistration?: string | null;
  dogId?: string | null;
}

export interface ScoringSnapshot {
  name?: string | null;
  class?: string | null;
  customClass?: string | null;
  heat?: string | null;
  raceTime?: string | null;
  raceType?: string | null;
  raceFormat?: string | null;
  weightPulled?: string | null;
  dogWeight?: string | null;
  associatedDog?: ScoringDogLike[] | null;
}

export interface SiblingIdentity {
  name: string;
  class: string;
  customClass: string;
}

function norm(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

function heatLabel(value?: string | null): string {
  return (value || "").trim() || "Heat 1";
}

/** Stable key for a dog team so order on the card does not look like a change. */
export function dogTeamSignature(dogs?: ScoringDogLike[] | null): string {
  return (dogs || [])
    .map((dog) => {
      const reg = norm(dog.NZFSSRegistration);
      if (reg && reg !== "unknown") return `reg:${reg}`;
      if (dog.dogId) return `id:${dog.dogId}`;
      return `name:${norm(dog.name)}`;
    })
    .sort()
    .join("|");
}

function wasProvided<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * True when the patch changes a field that stored points were calculated from.
 * Fields omitted from the patch (undefined) are ignored.
 */
export function scoringFieldsChanged(
  before: ScoringSnapshot,
  after: ScoringSnapshot
): boolean {
  if (
    wasProvided(after.associatedDog) &&
    dogTeamSignature(before.associatedDog) !== dogTeamSignature(after.associatedDog)
  ) {
    return true;
  }

  if (wasProvided(after.raceTime) && norm(before.raceTime) !== norm(after.raceTime)) {
    return true;
  }

  if (wasProvided(after.raceType) && norm(before.raceType) !== norm(after.raceType)) {
    return true;
  }

  if (wasProvided(after.heat) && heatLabel(before.heat) !== heatLabel(after.heat)) {
    return true;
  }

  if (
    wasProvided(after.weightPulled) &&
    norm(before.weightPulled) !== norm(after.weightPulled)
  ) {
    return true;
  }

  if (wasProvided(after.dogWeight) && norm(before.dogWeight) !== norm(after.dogWeight)) {
    return true;
  }

  if (wasProvided(after.name) && norm(before.name) !== norm(after.name)) {
    return true;
  }

  if (wasProvided(after.class) && norm(before.class) !== norm(after.class)) {
    return true;
  }

  if (
    wasProvided(after.customClass) &&
    norm(before.customClass) !== norm(after.customClass)
  ) {
    return true;
  }

  if (
    wasProvided(after.raceFormat) &&
    norm(before.raceFormat) !== norm(after.raceFormat)
  ) {
    return true;
  }

  return false;
}

function identityKey(identity: SiblingIdentity): string {
  return `${identity.name}::${identity.class}::${identity.customClass}`;
}

/**
 * Musher/class identities whose stored points belong to the same scoring unit
 * as this row — including heat siblings and a rename/class-move.
 */
export function scoringSiblingIdentities(
  before: SiblingIdentity,
  after?: Partial<SiblingIdentity>
): SiblingIdentity[] {
  const identities: SiblingIdentity[] = [
    {
      name: before.name,
      class: before.class,
      customClass: before.customClass || "",
    },
  ];

  if (after) {
    identities.push({
      name: after.name ?? before.name,
      class: after.class ?? before.class,
      customClass:
        after.customClass !== undefined
          ? after.customClass || ""
          : before.customClass || "",
    });
  }

  const unique: SiblingIdentity[] = [];
  const seen = new Set<string>();
  for (const identity of identities) {
    const key = identityKey(identity);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(identity);
  }
  return unique;
}
