"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dogTeamSignature = dogTeamSignature;
exports.scoringFieldsChanged = scoringFieldsChanged;
exports.scoringSiblingIdentities = scoringSiblingIdentities;
function norm(value) {
    return (value || "").trim().toLowerCase();
}
function heatLabel(value) {
    return (value || "").trim() || "Heat 1";
}
function dogTeamSignature(dogs) {
    return (dogs || [])
        .map((dog) => {
        const reg = norm(dog.NZFSSRegistration);
        if (reg && reg !== "unknown")
            return `reg:${reg}`;
        if (dog.dogId)
            return `id:${dog.dogId}`;
        return `name:${norm(dog.name)}`;
    })
        .sort()
        .join("|");
}
function wasProvided(value) {
    return value !== undefined;
}
function scoringFieldsChanged(before, after) {
    if (wasProvided(after.associatedDog) &&
        dogTeamSignature(before.associatedDog) !== dogTeamSignature(after.associatedDog)) {
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
    if (wasProvided(after.weightPulled) &&
        norm(before.weightPulled) !== norm(after.weightPulled)) {
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
    if (wasProvided(after.customClass) &&
        norm(before.customClass) !== norm(after.customClass)) {
        return true;
    }
    if (wasProvided(after.raceFormat) &&
        norm(before.raceFormat) !== norm(after.raceFormat)) {
        return true;
    }
    return false;
}
function identityKey(identity) {
    return `${identity.name}::${identity.class}::${identity.customClass}`;
}
function scoringSiblingIdentities(before, after) {
    const identities = [
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
            customClass: after.customClass !== undefined
                ? after.customClass || ""
                : before.customClass || "",
        });
    }
    const unique = [];
    const seen = new Set();
    for (const identity of identities) {
        const key = identityKey(identity);
        if (seen.has(key))
            continue;
        seen.add(key);
        unique.push(identity);
    }
    return unique;
}
//# sourceMappingURL=result-points-invalidation.js.map