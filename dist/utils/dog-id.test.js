"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const dog_id_1 = require("./dog-id");
const process_musher_dogs_1 = require("./process-musher-dogs");
(0, node_test_1.describe)("dog-id utilities", () => {
    (0, node_test_1.it)("generates valid UUID v4 dogIds", () => {
        const id = (0, dog_id_1.generateDogId)();
        strict_1.default.ok((0, dog_id_1.isValidDogId)(id));
    });
    (0, node_test_1.it)("resolveDogId preserves existing dogId and never changes it", () => {
        const existingId = "a1b2c3d4-e5f6-4789-a012-3456789abcde";
        const resolved = (0, dog_id_1.resolveDogId)({ dogId: existingId }, { dogId: existingId });
        strict_1.default.equal(resolved, existingId);
    });
    (0, node_test_1.it)("resolveDogId accepts _id alias", () => {
        const id = (0, dog_id_1.generateDogId)();
        strict_1.default.equal((0, dog_id_1.resolveDogId)({ _id: id }), id);
    });
    (0, node_test_1.it)("assertUniqueDogIds throws on duplicates", () => {
        const id = (0, dog_id_1.generateDogId)();
        strict_1.default.throws(() => (0, dog_id_1.assertUniqueDogIds)([{ dogId: id }, { dogId: id }], "test"));
    });
});
(0, node_test_1.describe)("process-musher-dogs", () => {
    (0, node_test_1.it)("assigns unique dogIds on create", () => {
        const dogs = (0, process_musher_dogs_1.processDogsForCreate)([
            { name: "Max", pedigreeName: "Alpha Max" },
            { name: "Luna", pedigreeName: "Beta Luna" },
        ]);
        strict_1.default.equal(dogs.length, 2);
        strict_1.default.ok((0, dog_id_1.isValidDogId)(dogs[0].dogId));
        strict_1.default.ok((0, dog_id_1.isValidDogId)(dogs[1].dogId));
        strict_1.default.notEqual(dogs[0].dogId, dogs[1].dogId);
    });
    (0, node_test_1.it)("preserves dogId when pedigree name changes on update", () => {
        const existingId = (0, dog_id_1.generateDogId)();
        const existing = [
            {
                dogId: existingId,
                name: "Max",
                nzfssNo: "NZ-001",
                pedigreeName: "Old Pedigree",
            },
        ];
        const updated = (0, process_musher_dogs_1.processDogsForUpdate)([
            {
                dogId: existingId,
                name: "Max",
                nzfssNo: "NZ-001",
                pedigreeName: "New Pedigree Name",
            },
        ], existing);
        strict_1.default.equal(updated.length, 1);
        strict_1.default.equal(updated[0].dogId, existingId);
        strict_1.default.equal(updated[0].pedigreeName, "New Pedigree Name");
    });
    (0, node_test_1.it)("matches existing dog by nzfssNo when dogId omitted", () => {
        const existingId = (0, dog_id_1.generateDogId)();
        const updated = (0, process_musher_dogs_1.processDogsForUpdate)([{ name: "Max", nzfssNo: "NZ-002", pedigreeName: "Renamed" }], [{ dogId: existingId, name: "Max", nzfssNo: "NZ-002", pedigreeName: "Original" }]);
        strict_1.default.equal(updated[0].dogId, existingId);
    });
    (0, node_test_1.it)("findExistingDog does not match by pedigree name alone", () => {
        const lookup = (0, dog_id_1.buildDogLookup)([
            { dogId: (0, dog_id_1.generateDogId)(), name: "Max", pedigreeName: "Old Name" },
        ]);
        const found = (0, dog_id_1.findExistingDog)({ name: "Different Pet" }, lookup);
        strict_1.default.equal(found, undefined);
    });
});
//# sourceMappingURL=dog-id.test.js.map