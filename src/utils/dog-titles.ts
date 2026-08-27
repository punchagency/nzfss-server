/**
 * Sled Dog title logic (server-side).
 *
 * Titles are earned sequentially from race points:
 *   Sled Dog (SD) -> Sled Dog Excellence (SDX) -> Sled Dog Champion (SDCh)
 *
 * This mirrors the client `determineAward` thresholds used on the public
 * Dog Race Points page so server-calculated titles stay consistent with what
 * the public site displays.
 */

export type TitleCode = "SD" | "SDX" | "SDCh";

/** Ordered lowest -> highest. Index is used as the title rank. */
export const TITLE_ORDER: TitleCode[] = ["SD", "SDX", "SDCh"];

export const TITLE_LABELS: Record<TitleCode, string> = {
  SD: "Sled Dog",
  SDX: "Sled Dog Excellence",
  SDCh: "Sled Dog Champion",
};

export interface TitleInputs {
  /** Points earned within the cutoff time. Drives SDX / SDCh. */
  pointsWithinCutoff: number;
  /** All points (within + outside cutoff). Drives SD. */
  totalPoints: number;
  /** Finishing-position credits: 1st = 4, 2nd = 2, 3rd = 1. Drives SDCh. */
  positionCredits: number;
}

/**
 * Position credits required for SDCh: equivalent of 4 firsts, 8 seconds,
 * or 16 thirds (1st = 4, 2nd = 2, 3rd = 1).
 */
export const SDCH_POSITION_CREDITS = 16;
export const SDCH_POINTS = 180;
export const SDX_POINTS = 90;
export const SD_POINTS = 45;

export function positionCreditsFor(positions: {
  first: number;
  second: number;
  third: number;
}): number {
  return positions.first * 4 + positions.second * 2 + positions.third;
}

/**
 * Returns the highest title a dog currently qualifies for, or null if none.
 * Evaluation order matches the client: SDCh -> SDX -> SD.
 */
export function determineTitle(inputs: TitleInputs): TitleCode | null {
  const { pointsWithinCutoff, totalPoints, positionCredits } = inputs;

  if (pointsWithinCutoff >= SDCH_POINTS && positionCredits >= SDCH_POSITION_CREDITS) {
    return "SDCh";
  }
  if (pointsWithinCutoff >= SDX_POINTS) {
    return "SDX";
  }
  if (totalPoints >= SD_POINTS) {
    return "SD";
  }
  return null;
}

/** Numeric rank of a title (higher = more advanced). null/none = -1. */
export function titleRank(title: TitleCode | null | undefined): number {
  if (!title) return -1;
  return TITLE_ORDER.indexOf(title);
}

/**
 * Every title at or below the given title is considered "achieved".
 * SDCh implies SDX and SD; SDX implies SD.
 */
export function achievedTitlesUpTo(title: TitleCode | null): Record<TitleCode, boolean> {
  const rank = titleRank(title);
  return {
    SD: rank >= titleRank("SD"),
    SDX: rank >= titleRank("SDX"),
    SDCh: rank >= titleRank("SDCh"),
  };
}

export interface TitleRecognitionFlags {
  sd: boolean;
  sdx: boolean;
  sdCh: boolean;
}

export function emptyRecognitionFlags(): TitleRecognitionFlags {
  return { sd: false, sdx: false, sdCh: false };
}

/** Maps a title code to its recognition-flag key. */
export function recognitionKey(title: TitleCode): keyof TitleRecognitionFlags {
  switch (title) {
    case "SD":
      return "sd";
    case "SDX":
      return "sdx";
    case "SDCh":
      return "sdCh";
  }
}

/** Highest title whose recognised flag is set, or null. */
export function highestRecognisedTitle(
  flags: TitleRecognitionFlags | undefined
): TitleCode | null {
  if (!flags) return null;
  if (flags.sdCh) return "SDCh";
  if (flags.sdx) return "SDX";
  if (flags.sd) return "SD";
  return null;
}

/**
 * Determines whether a dog's highest earned title sits above what has already
 * been recognised — i.e. whether it is a genuine upgrade awaiting a certificate.
 *
 * Rules:
 *  - No earned title                      -> not a change (exclude)
 *  - Earned title at or below recognised  -> exclude
 *  - Earned title above recognised        -> include
 *
 * Compares ranks rather than the single matching flag so that a dog recognised
 * at a *higher* title than it currently computes is never reported as a change
 * (which would render a downgrade as though it were an upgrade).
 */
export function isUnrecognisedTitleChange(
  earnedTitle: TitleCode | null,
  recognisedTitle: TitleCode | null
): boolean {
  if (!earnedTitle) return false;
  return titleRank(earnedTitle) > titleRank(recognisedTitle);
}
