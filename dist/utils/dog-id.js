"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOG_ID_REGEX = void 0;
exports.generateDogId = generateDogId;
exports.isValidDogId = isValidDogId;
exports.resolveDogId = resolveDogId;
exports.buildDogLookup = buildDogLookup;
exports.findExistingDog = findExistingDog;
exports.assertUniqueDogIds = assertUniqueDogIds;
const crypto_1 = require("crypto");
exports.DOG_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function generateDogId() {
    return (0, crypto_1.randomUUID)();
}
function isValidDogId(id) {
    return typeof id === "string" && exports.DOG_ID_REGEX.test(id);
}
function resolveDogId(input, existing) {
    if (input.dogId && isValidDogId(input.dogId))
        return input.dogId;
    if (input._id && isValidDogId(input._id))
        return input._id;
    if (existing?.dogId && isValidDogId(existing.dogId))
        return existing.dogId;
    return generateDogId();
}
function buildDogLookup(dogs) {
    const byDogId = new Map();
    const byNzfss = new Map();
    const byName = new Map();
    for (const dog of dogs) {
        if (dog.dogId && isValidDogId(dog.dogId)) {
            byDogId.set(dog.dogId, dog);
        }
        const nzfss = (dog.nzfssNo || dog.nzfssNumber || "").trim().toLowerCase();
        if (nzfss)
            byNzfss.set(nzfss, dog);
        const name = (dog.name || dog.petName || "").trim().toLowerCase();
        if (name)
            byName.set(name, dog);
    }
    return { byDogId, byNzfss, byName };
}
function findExistingDog(input, lookup) {
    const id = input.dogId || input._id;
    if (id && lookup.byDogId.has(id))
        return lookup.byDogId.get(id);
    const nzfss = (input.nzfssNo || input.nzfssNumber || "").trim().toLowerCase();
    if (nzfss && lookup.byNzfss.has(nzfss))
        return lookup.byNzfss.get(nzfss);
    const name = (input.name || input.petName || "").trim().toLowerCase();
    if (name && lookup.byName.has(name))
        return lookup.byName.get(name);
    return undefined;
}
function assertUniqueDogIds(dogs, context) {
    const seen = new Set();
    for (const dog of dogs) {
        if (!dog.dogId || !isValidDogId(dog.dogId))
            continue;
        if (seen.has(dog.dogId)) {
            throw new Error(`Duplicate dogId "${dog.dogId}" in ${context}`);
        }
        seen.add(dog.dogId);
    }
}
//# sourceMappingURL=dog-id.js.map