/**
 * Which race classes are allowed to earn points (server-side).
 *
 * Mirrors `nzfss-client-main/lib/class-eligibility.ts`. The client applies this
 * when results are entered, deciding what gets written; the server applies it
 * when aggregating, so already-stored points from a non-scoring class are not
 * counted toward a dog's total. Change both together.
 */

export interface EligibilityEntrant {
  class?: string | null;
  customClass?: string | null;
}

/**
 * Approved classes that never award points — neither musher placing points nor
 * Championship Harness Dog points. They remain valid to enter and appear in
 * results; they just do not score.
 *
 * Matched on a word starting with "bike" or "cani" so the many recorded
 * spellings are covered: "Bikejoring", "2 Dog Bikejor", "1 Dog Bikejour"
 * (misspelt), "VETERAN 1 DOG BIKE", "Canicross - Long", "CANICROSS MENS".
 * No scoring class contains either word.
 */
export const NON_SCORING_CLASS_PATTERN = /\b(bike|cani)/i;

/** True for a class that is excluded from scoring. */
export function isNonScoringClass(entrant?: EligibilityEntrant | null): boolean {
  if (!entrant) return false;
  const className = (entrant.customClass || "").trim();
  if (!className) return false;
  return NON_SCORING_CLASS_PATTERN.test(className);
}
