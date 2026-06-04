"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DogResolver = void 0;
exports.ensureDogIdsForSave = ensureDogIdsForSave;
const type_graphql_1 = require("type-graphql");
const musher_schema_1 = require("../schema/musher.schema");
const dog_id_1 = require("../utils/dog-id");
let DogResolver = class DogResolver {
    dogId(dog) {
        const id = dog.dogId;
        if (id && (0, dog_id_1.isValidDogId)(id))
            return id;
        return null;
    }
    _id(dog) {
        const id = (dog.dogId || dog._id);
        if (id && (0, dog_id_1.isValidDogId)(id))
            return id;
        return null;
    }
};
exports.DogResolver = DogResolver;
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", String)
], DogResolver.prototype, "dogId", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", String)
], DogResolver.prototype, "_id", null);
exports.DogResolver = DogResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => musher_schema_1.Dog)
], DogResolver);
function ensureDogIdsForSave(dogs) {
    const used = new Set();
    return dogs.map((dog) => {
        let dogId = dog.dogId;
        if (!(0, dog_id_1.isValidDogId)(dogId))
            dogId = (0, dog_id_1.generateDogId)();
        while (used.has(dogId))
            dogId = (0, dog_id_1.generateDogId)();
        used.add(dogId);
        return { ...dog, dogId };
    });
}
//# sourceMappingURL=dog.resolver.js.map