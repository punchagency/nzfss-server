"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SD_POINTS = exports.SDX_POINTS = exports.SDCH_POINTS = exports.SDCH_POSITION_CREDITS = exports.TITLE_LABELS = exports.TITLE_ORDER = void 0;
exports.positionCreditsFor = positionCreditsFor;
exports.determineTitle = determineTitle;
exports.titleRank = titleRank;
exports.achievedTitlesUpTo = achievedTitlesUpTo;
exports.emptyRecognitionFlags = emptyRecognitionFlags;
exports.recognitionKey = recognitionKey;
exports.highestRecognisedTitle = highestRecognisedTitle;
exports.isUnrecognisedTitleChange = isUnrecognisedTitleChange;
exports.TITLE_ORDER = ["SD", "SDX", "SDCh"];
exports.TITLE_LABELS = {
    SD: "Sled Dog",
    SDX: "Sled Dog Excellence",
    SDCh: "Sled Dog Champion",
};
exports.SDCH_POSITION_CREDITS = 16;
exports.SDCH_POINTS = 180;
exports.SDX_POINTS = 90;
exports.SD_POINTS = 45;
function positionCreditsFor(positions) {
    return positions.first * 4 + positions.second * 2 + positions.third;
}
function determineTitle(inputs) {
    const { pointsWithinCutoff, totalPoints, positionCredits } = inputs;
    if (pointsWithinCutoff >= exports.SDCH_POINTS && positionCredits >= exports.SDCH_POSITION_CREDITS) {
        return "SDCh";
    }
    if (pointsWithinCutoff >= exports.SDX_POINTS) {
        return "SDX";
    }
    if (totalPoints >= exports.SD_POINTS) {
        return "SD";
    }
    return null;
}
function titleRank(title) {
    if (!title)
        return -1;
    return exports.TITLE_ORDER.indexOf(title);
}
function achievedTitlesUpTo(title) {
    const rank = titleRank(title);
    return {
        SD: rank >= titleRank("SD"),
        SDX: rank >= titleRank("SDX"),
        SDCh: rank >= titleRank("SDCh"),
    };
}
function emptyRecognitionFlags() {
    return { sd: false, sdx: false, sdCh: false };
}
function recognitionKey(title) {
    switch (title) {
        case "SD":
            return "sd";
        case "SDX":
            return "sdx";
        case "SDCh":
            return "sdCh";
    }
}
function highestRecognisedTitle(flags) {
    if (!flags)
        return null;
    if (flags.sdCh)
        return "SDCh";
    if (flags.sdx)
        return "SDX";
    if (flags.sd)
        return "SD";
    return null;
}
function isUnrecognisedTitleChange(earnedTitle, flags) {
    if (!earnedTitle)
        return false;
    const key = recognitionKey(earnedTitle);
    return !(flags && flags[key]);
}
//# sourceMappingURL=dog-titles.js.map