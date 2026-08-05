"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NON_SCORING_CLASS_PATTERN = void 0;
exports.isNonScoringClass = isNonScoringClass;
exports.NON_SCORING_CLASS_PATTERN = /\b(bike|cani)/i;
function isNonScoringClass(entrant) {
    if (!entrant)
        return false;
    const className = (entrant.customClass || "").trim();
    if (!className)
        return false;
    return exports.NON_SCORING_CLASS_PATTERN.test(className);
}
//# sourceMappingURL=class-eligibility.js.map