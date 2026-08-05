"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRegistration = parseRegistration;
exports.normalizeKennelReg = normalizeKennelReg;
exports.extractPetName = extractPetName;
exports.findAmbiguousPetNames = findAmbiguousPetNames;
exports.getDogMergeKey = getDogMergeKey;
exports.findAmbiguousRcrDogIds = findAmbiguousRcrDogIds;
exports.getRcrMergeKey = getRcrMergeKey;
exports.getLiveDogMergeKey = getLiveDogMergeKey;
exports.timeToSeconds = timeToSeconds;
exports.aggregateDogPoints = aggregateDogPoints;
const class_eligibility_1 = require("./class-eligibility");
function parseRegistration(reg) {
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
function normalizeKennelReg(reg) {
    return parseRegistration(reg).kennelReg.toLowerCase();
}
function normalizeFullName(workingName) {
    return workingName.replace(/\s+/g, " ").trim().toLowerCase();
}
function extractPetName(name, registration, ambiguousPetNames) {
    const { petNameFromReg } = parseRegistration(registration);
    if (petNameFromReg)
        return petNameFromReg.toLowerCase();
    const trimmed = (name || "").trim();
    if (!trimmed)
        return "unknown";
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
    const shortened = (petName) => ambiguousPetNames?.has(`${normalizeKennelReg(registration)}|${petName}`)
        ? normalizeFullName(workingName)
        : petName;
    const possessive = workingName.match(/'s\s+(.+)$/i);
    if (possessive) {
        const petPart = possessive[1].trim();
        const ofMatch = petPart.match(/^(\S+)\s+of\s+/i);
        if (ofMatch)
            return shortened(ofMatch[1].toLowerCase());
        return shortened(petPart.split(/\s+/)[0].toLowerCase());
    }
    if (/\s+(at|by)\s+/i.test(workingName)) {
        const beforeAtOrBy = workingName.split(/\s+(at|by)\s+/i)[0].trim();
        const words = beforeAtOrBy.split(/\s+/);
        return shortened(words[words.length - 1].toLowerCase());
    }
    const ofKennelMatch = workingName.match(/^(\S+)\s+of\s+/i);
    if (ofKennelMatch)
        return shortened(ofKennelMatch[1].toLowerCase());
    const { kennelReg, petNameFromReg: regHasPetSuffix } = parseRegistration(registration);
    const words = workingName.split(/\s+/).filter(Boolean);
    if (words.length > 1 && kennelReg && !regHasPetSuffix) {
        return shortened(words[words.length - 1].toLowerCase());
    }
    return normalizeFullName(workingName);
}
function findAmbiguousPetNames(rcrPoints) {
    const namesByKey = new Map();
    for (const rcr of rcrPoints) {
        const name = rcr.rcrPedigreeName?.trim();
        if (!name || name.toLowerCase() === "n/a")
            continue;
        const registration = rcr.rcrReg || rcr.rcrFlag;
        const key = `${normalizeKennelReg(registration)}|${extractPetName(name, registration)}`;
        if (!namesByKey.has(key))
            namesByKey.set(key, new Set());
        namesByKey.get(key).add(name.toLowerCase());
    }
    const ambiguous = new Set();
    for (const [key, names] of namesByKey) {
        if (names.size > 1)
            ambiguous.add(key);
    }
    return ambiguous;
}
function getDogMergeKey(params) {
    if (params.dogId && params.dogId.trim()) {
        return `id:${params.dogId.trim().toLowerCase()}`;
    }
    const kennelReg = normalizeKennelReg(params.registration);
    const petName = extractPetName(params.name, params.registration, params.ambiguousPetNames);
    return `reg:${kennelReg}|${petName}`;
}
function findAmbiguousRcrDogIds(rcrPoints) {
    const namesByDogId = new Map();
    for (const rcr of rcrPoints) {
        const dogId = rcr.dogId?.trim().toLowerCase();
        const name = rcr.rcrPedigreeName?.trim().toLowerCase();
        if (!dogId || !name || name === "n/a")
            continue;
        if (!namesByDogId.has(dogId))
            namesByDogId.set(dogId, new Set());
        namesByDogId.get(dogId).add(name);
    }
    const ambiguous = new Set();
    for (const [dogId, names] of namesByDogId) {
        if (names.size > 1)
            ambiguous.add(dogId);
    }
    return ambiguous;
}
function getRcrMergeKey(rcr, ambiguousDogIds, ambiguousPetNames) {
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
function getLiveDogMergeKey(dog, ambiguousDogIds, ambiguousPetNames) {
    const dogId = dog.dogId?.trim().toLowerCase();
    const useDogId = dogId && !ambiguousDogIds.has(dogId) ? dog.dogId : undefined;
    return getDogMergeKey({
        dogId: useDogId,
        name: dog.name,
        registration: dog.NZFSSRegistration,
        ambiguousPetNames,
    });
}
function timeToSeconds(timeStr) {
    if (!timeStr || !/^\d{1,2}:\d{2}:\d{2}(\.\d+)?$/.test(timeStr)) {
        return Number.MAX_VALUE;
    }
    const [h, m, s] = timeStr.split(":");
    const hours = parseInt(h || "0", 10);
    const minutes = parseInt(m || "0", 10);
    const seconds = parseFloat(s || "0");
    return hours * 3600 + minutes * 60 + seconds;
}
function hasValidFinish(raceType) {
    const status = (raceType || "").toLowerCase();
    return !["did not start", "did not finish", "disqualified", "did not qualify"].includes(status);
}
function pickDisplayName(current, candidate) {
    if (!current || current === "Unknown")
        return candidate;
    if (!candidate)
        return current;
    const currentIsShortCaps = current === current.toUpperCase() && !current.includes(" ");
    const candidateIsPedigree = candidate.includes("'") ||
        (candidate !== candidate.toUpperCase() && candidate.includes(" "));
    if (currentIsShortCaps && candidateIsPedigree)
        return candidate;
    if (candidate.length > current.length)
        return candidate;
    return current;
}
function ensureAggregate(map, key, seed) {
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
function aggregateDogPoints(points, rcrPoints, resolveKey) {
    const map = new Map();
    const ambiguousRcrDogIds = findAmbiguousRcrDogIds(rcrPoints);
    const ambiguousPetNames = findAmbiguousPetNames(rcrPoints);
    const keyOf = (naturalKey) => (resolveKey && resolveKey(naturalKey)) || naturalKey;
    const rankGroups = new Map();
    for (const point of points) {
        const entrant = point.entrant;
        if (!entrant || !Array.isArray(entrant.associatedDog) || entrant.associatedDog.length === 0) {
            continue;
        }
        if (!hasValidFinish(entrant.raceType))
            continue;
        if ((0, class_eligibility_1.isNonScoringClass)(entrant))
            continue;
        const secs = timeToSeconds(entrant.raceTime);
        if (secs >= Number.MAX_VALUE)
            continue;
        const eventId = entrant.eventId || "unknown-event";
        const classKey = `${(entrant.class || "").trim().toLowerCase()}::${(entrant.customClass || "").trim().toLowerCase()}`;
        const groupKey = `${eventId}::${classKey}`;
        const dogKeys = entrant.associatedDog.map((dog) => keyOf(getLiveDogMergeKey(dog, ambiguousRcrDogIds, ambiguousPetNames)));
        if (!rankGroups.has(groupKey))
            rankGroups.set(groupKey, []);
        rankGroups.get(groupKey).push({ totalSeconds: secs, dogKeys });
    }
    for (const point of points) {
        const entrant = point.entrant;
        if (!entrant || !Array.isArray(entrant.associatedDog) || entrant.associatedDog.length === 0) {
            continue;
        }
        const storedCutoff = timeToSeconds(point.cutoffTime);
        const raceTime = timeToSeconds(entrant.raceTime);
        const isWithinCutoff = storedCutoff < Number.MAX_VALUE && raceTime < Number.MAX_VALUE
            ? raceTime <= storedCutoff
            : false;
        const scores = !(0, class_eligibility_1.isNonScoringClass)(entrant);
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
            if (!agg.dogId && dog.dogId)
                agg.dogId = dog.dogId;
            agg.displayName = pickDisplayName(agg.displayName, dog.name || petNameFromReg || "");
            if ((!agg.breed || agg.breed === "Unknown") && dog.breed)
                agg.breed = dog.breed;
            let dogPointsValue = 0;
            const parsedReg = kennelReg || dog.NZFSSRegistration || "";
            if (!scores) {
                dogPointsValue = 0;
            }
            else if (Array.isArray(point.dogPoints) && point.dogPoints.length > 0) {
                const entry = point.dogPoints.find((dp) => (dog.dogId && dp.dogId === dog.dogId) ||
                    dp.NZFSSRegistration === dog.NZFSSRegistration ||
                    dp.NZFSSRegistration === parsedReg);
                dogPointsValue = entry
                    ? entry.points
                    : point.points / entrant.associatedDog.length;
            }
            else {
                dogPointsValue = point.points / entrant.associatedDog.length;
            }
            if (isWithinCutoff)
                agg.pointsWithinCutoff += dogPointsValue;
            else
                agg.pointsOutsideCutoff += dogPointsValue;
            agg.events += 1;
        }
    }
    for (const rows of rankGroups.values()) {
        const sorted = [...rows].sort((a, b) => a.totalSeconds - b.totalSeconds);
        sorted.forEach((row, index) => {
            const place = index + 1;
            if (place > 3)
                return;
            for (const dogKey of row.dogKeys) {
                const agg = map.get(dogKey);
                if (!agg)
                    continue;
                if (place === 1)
                    agg.positions.first += 1;
                else if (place === 2)
                    agg.positions.second += 1;
                else if (place === 3)
                    agg.positions.third += 1;
            }
        });
    }
    for (const rcr of rcrPoints) {
        const name = rcr.rcrPedigreeName;
        if (!name || name.trim() === "" || name.toLowerCase() === "n/a")
            continue;
        const regValue = rcr.rcrReg || rcr.rcrFlag;
        const naturalKey = getRcrMergeKey(rcr, ambiguousRcrDogIds, ambiguousPetNames);
        const key = keyOf(naturalKey);
        const { kennelReg, petNameFromReg } = parseRegistration(regValue);
        const trustedDogId = rcr.dogId && !ambiguousRcrDogIds.has(rcr.dogId.trim().toLowerCase())
            ? rcr.dogId
            : undefined;
        const agg = ensureAggregate(map, key, {
            dogId: trustedDogId,
            petName: extractPetName(name, regValue, ambiguousPetNames),
            displayName: name || petNameFromReg || "Unknown",
            kennelReg: kennelReg || regValue || "",
            breed: rcr.rcrBreed,
        });
        if (!agg.dogId && trustedDogId)
            agg.dogId = trustedDogId;
        agg.displayName = pickDisplayName(agg.displayName, name);
        if ((!agg.breed || agg.breed === "Unknown") && rcr.rcrBreed)
            agg.breed = rcr.rcrBreed;
        agg.pointsWithinCutoff += rcr.rcrPoints || 0;
        agg.events += rcr.rcrEvents || 0;
        if (rcr.rcrAwards && !agg.historicalAwards)
            agg.historicalAwards = rcr.rcrAwards;
    }
    return map;
}
//# sourceMappingURL=dog-points-aggregation.js.map