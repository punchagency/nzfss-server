"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDogsForCreate = processDogsForCreate;
exports.processDogsForUpdate = processDogsForUpdate;
exports.ensureDogIdsOnStoredDogs = ensureDogIdsOnStoredDogs;
const dog_id_1 = require("./dog-id");
function toProcessedDog(dogId, dog) {
    return {
        dogId,
        name: dog.name || "",
        pedigreeName: dog.pedigreeName || "",
        nzkcNo: dog.nzkcNo || "",
        nzfssNo: dog.nzfssNo || "",
        dateOfBirth: dog.dob || dog.dateOfBirth || "",
        breed: dog.breed || "",
        deceased: Boolean(dog.deceased),
    };
}
function processDogsForCreate(dogs) {
    const processed = dogs.map((dog) => {
        const dogId = (0, dog_id_1.resolveDogId)(dog);
        return toProcessedDog(dogId, dog);
    });
    (0, dog_id_1.assertUniqueDogIds)(processed, "createMusher");
    return processed;
}
function processDogsForUpdate(inputDogs, existingDogs = []) {
    const lookup = (0, dog_id_1.buildDogLookup)(existingDogs);
    const processed = inputDogs.map((dog) => {
        const existing = (0, dog_id_1.findExistingDog)(dog, lookup);
        const dogId = (0, dog_id_1.resolveDogId)(dog, existing);
        return toProcessedDog(dogId, dog);
    });
    (0, dog_id_1.assertUniqueDogIds)(processed, "updateMusher");
    return processed;
}
function ensureDogIdsOnStoredDogs(dogs) {
    const usedIds = new Set();
    return dogs.map((dog) => {
        let dogId = dog.dogId;
        if (!(0, dog_id_1.isValidDogId)(dogId)) {
            dogId = (0, dog_id_1.generateDogId)();
        }
        while (usedIds.has(dogId)) {
            dogId = (0, dog_id_1.generateDogId)();
        }
        usedIds.add(dogId);
        return toProcessedDog(dogId, dog);
    });
}
//# sourceMappingURL=process-musher-dogs.js.map