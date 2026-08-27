"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const apollo_server_1 = require("apollo-server");
const musher_model_1 = require("../models/musher.model");
const musher_schema_1 = require("../schema/musher.schema");
const club_schema_1 = require("../schema/club.schema");
const process_musher_dogs_1 = require("../utils/process-musher-dogs");
const dog_id_1 = require("../utils/dog-id");
const dog_resolver_1 = require("./dog.resolver");
let MusherResolver = class MusherResolver {
    async persistDogIdsIfMissing(musherId, doc) {
        const dogs = doc.dogs || [];
        const needsFix = dogs.some((d) => !(0, dog_id_1.isValidDogId)(d.dogId));
        if (!needsFix)
            return doc;
        const fixed = (0, dog_resolver_1.ensureDogIdsForSave)(dogs.map((d) => ({
            name: d.name || "",
            pedigreeName: d.pedigreeName || "",
            nzkcNo: d.nzkcNo || "",
            nzfssNo: d.nzfssNo || "",
            dateOfBirth: d.dateOfBirth ||
                d.dob ||
                "",
            breed: d.breed || "",
            deceased: Boolean(d.deceased),
            dogId: d.dogId,
            ...(d.titleRecognition
                ? { titleRecognition: d.titleRecognition }
                : {}),
        })));
        await musher_model_1.MusherModel.findByIdAndUpdate(musherId, { $set: { dogs: fixed } });
        return { ...doc, dogs: fixed };
    }
    mapDogToGraphQL(dog) {
        const dogId = dog.dogId && (0, dog_id_1.isValidDogId)(dog.dogId) ? dog.dogId : "";
        return {
            dogId,
            _id: dogId,
            name: dog.name,
            pedigreeName: dog.pedigreeName,
            nzkcNo: dog.nzkcNo,
            nzfssNo: dog.nzfssNo,
            dateOfBirth: dog.dateOfBirth || dog.dob,
            breed: dog.breed,
            deceased: Boolean(dog.deceased),
            titleRecognition: dog.titleRecognition
                ? {
                    sd: Boolean(dog.titleRecognition.sd),
                    sdx: Boolean(dog.titleRecognition.sdx),
                    sdCh: Boolean(dog.titleRecognition.sdCh),
                }
                : null,
        };
    }
    transformMusherDocument(doc) {
        const storedDogs = doc.dogs || [];
        return {
            id: doc._id.toString(),
            name: doc.name,
            registrationNo: doc.registrationNo,
            kennelRegistrationNo: doc.kennelRegistrationNo,
            club: doc.club?._id?.toString() || doc.club?.toString() || null,
            address: doc.address || undefined,
            phone: doc.phone || undefined,
            email: doc.email || undefined,
            dateOfBirth: doc.dateOfBirth || undefined,
            guardianDetails: doc.guardianDetails || undefined,
            dogs: storedDogs.map((dog) => this.mapDogToGraphQL(dog)),
            showProfileConsent: doc.showProfileConsent,
            createdAt: doc.createdAt || new Date(),
            updatedAt: doc.updatedAt || new Date(),
        };
    }
    async createMusher(input, context) {
        if (!context.user?._id) {
            throw new apollo_server_1.ApolloError("User not authenticated");
        }
        try {
            if (!input.clubId) {
                throw new apollo_server_1.ApolloError("Club ID is required");
            }
            const club = await club_schema_1.ClubModel.findById(input.clubId);
            if (!club) {
                throw new apollo_server_1.ApolloError("Invalid club ID: Club not found");
            }
            const processedDogs = (0, dog_resolver_1.ensureDogIdsForSave)((0, process_musher_dogs_1.processDogsForCreate)(input.dogs));
            const musher = await musher_model_1.MusherModel.create({
                name: input.name,
                registrationNo: input.registrationNo,
                kennelRegistrationNo: input.kennelRegistrationNo,
                club: input.clubId,
                address: input.address,
                phone: input.phone,
                email: input.email,
                dateOfBirth: input.dateOfBirth,
                guardianDetails: input.guardianDetails,
                showProfileConsent: input.showProfileConsent,
                dogs: processedDogs,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const doc = await this.persistDogIdsIfMissing(musher._id.toString(), musher.toObject());
            return this.transformMusherDocument(doc);
        }
        catch (error) {
            console.error("Error creating musher:", error);
            throw new apollo_server_1.ApolloError(`Failed to create musher: ${error.message}`);
        }
    }
    async getMushers(context, clubId) {
        try {
            if (clubId) {
                const mushers = await musher_model_1.MusherModel.find({ club: clubId })
                    .populate('club')
                    .lean();
                const validMushers = mushers.filter(musher => musher.club);
                return validMushers.map(musher => this.transformMusherDocument(musher));
            }
            const mushers = await musher_model_1.MusherModel.find()
                .populate('club')
                .lean();
            const validMushers = mushers.filter(musher => musher.club);
            return validMushers.map(musher => this.transformMusherDocument(musher));
        }
        catch (error) {
            console.error("Error fetching mushers:", error);
            throw new apollo_server_1.ApolloError(`Failed to fetch mushers: ${error.message}`);
        }
    }
    async getMusherRegistrations() {
        try {
            const mushers = await musher_model_1.MusherModel.find({}, { name: 1, registrationNo: 1 }).lean();
            return mushers.map((musher) => ({
                id: musher._id.toString(),
                name: musher.name,
                registrationNo: musher.registrationNo,
            }));
        }
        catch (error) {
            console.error("Error fetching musher registrations:", error);
            throw new apollo_server_1.ApolloError(`Failed to fetch musher registrations: ${error.message}`);
        }
    }
    async getClubMushers(context, clubId) {
        try {
            const targetClubId = clubId || context.user?._id;
            if (!targetClubId) {
                throw new apollo_server_1.ApolloError("No club ID provided and user not authenticated");
            }
            const mushers = await musher_model_1.MusherModel.find({ club: targetClubId })
                .populate('club')
                .lean();
            const validMushers = mushers.filter(musher => musher.club);
            return validMushers.map(musher => this.transformMusherDocument(musher));
        }
        catch (error) {
            console.error("Error fetching club mushers:", error);
            throw new apollo_server_1.ApolloError(`Failed to fetch club mushers: ${error.message}`);
        }
    }
    async updateMusher(id, input, context) {
        if (!context.user?._id) {
            throw new apollo_server_1.ApolloError("User not authenticated");
        }
        try {
            const existingMusher = await musher_model_1.MusherModel.findById(id).lean();
            if (!existingMusher) {
                throw new apollo_server_1.ApolloError("Musher not found");
            }
            let processedDogs;
            if (input.dogs) {
                processedDogs = (0, dog_resolver_1.ensureDogIdsForSave)((0, process_musher_dogs_1.processDogsForUpdate)(input.dogs, existingMusher.dogs || []));
            }
            const { clubId, dogs: _dogs, ...restInput } = input;
            const updateData = {
                ...restInput,
                ...(processedDogs && { dogs: processedDogs }),
                ...(clubId && { club: clubId }),
                updatedAt: new Date()
            };
            const updatedMusher = await musher_model_1.MusherModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).populate('club').lean();
            if (!updatedMusher) {
                throw new apollo_server_1.ApolloError("Failed to update musher");
            }
            const doc = await this.persistDogIdsIfMissing(id, updatedMusher);
            return this.transformMusherDocument(doc);
        }
        catch (error) {
            console.error("Error updating musher:", error);
            throw new apollo_server_1.ApolloError(`Failed to update musher: ${error.message}`);
        }
    }
    async deleteMusher(id, context) {
        if (!context.user?._id) {
            throw new apollo_server_1.ApolloError("User not authenticated");
        }
        try {
            const existingMusher = await musher_model_1.MusherModel.findOne({ _id: id });
            if (!existingMusher) {
                throw new apollo_server_1.ApolloError("Musher not found");
            }
            const result = await musher_model_1.MusherModel.findByIdAndDelete(id);
            if (!result) {
                throw new apollo_server_1.ApolloError("Failed to delete musher");
            }
            return true;
        }
        catch (error) {
            console.error("Error deleting musher:", error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError(`Failed to delete musher: ${error.message}`);
        }
    }
    async checkDuplicateMusher(context, surname, nzfssRegistrationNumber) {
        try {
            const duplicates = [];
            if (nzfssRegistrationNumber && nzfssRegistrationNumber.trim()) {
                const mushersByRegistration = await musher_model_1.MusherModel.find({
                    registrationNo: { $regex: new RegExp(`^${nzfssRegistrationNumber.trim()}$`, 'i') }
                }).populate('club').lean();
                duplicates.push(...mushersByRegistration.map(musher => this.transformMusherDocument(musher)));
            }
            if (surname && surname.trim()) {
                const mushersBySurname = await musher_model_1.MusherModel.find({
                    name: { $regex: new RegExp(`\\b${surname.trim()}$`, 'i') }
                }).populate('club').lean();
                const newMushers = mushersBySurname.filter(musher => !duplicates.some(existing => existing.id === musher._id.toString()));
                duplicates.push(...newMushers.map(musher => this.transformMusherDocument(musher)));
            }
            return duplicates;
        }
        catch (error) {
            console.error("Error checking for duplicate mushers:", error);
            throw new apollo_server_1.ApolloError(`Failed to check for duplicate mushers: ${error.message}`);
        }
    }
    async getMushersForEvent(context, eventId) {
        try {
            const { EntrantModel } = await Promise.resolve().then(() => __importStar(require("../schema/entrants.schema")));
            const entrants = await EntrantModel.find({ eventId: eventId })
                .populate('associatedDog')
                .lean();
            if (entrants.length === 0) {
                return [];
            }
            const eventDogRegistrations = new Set();
            const eventDogIds = new Set();
            entrants.forEach(entrant => {
                if (entrant.associatedDog && Array.isArray(entrant.associatedDog)) {
                    entrant.associatedDog.forEach(dog => {
                        if (dog.NZFSSRegistration && dog.NZFSSRegistration.trim() !== '') {
                            eventDogRegistrations.add(dog.NZFSSRegistration);
                        }
                        if (dog.dogId && (0, dog_id_1.isValidDogId)(dog.dogId)) {
                            eventDogIds.add(dog.dogId);
                        }
                    });
                }
            });
            if (eventDogRegistrations.size === 0 && eventDogIds.size === 0) {
                return [];
            }
            const queryConditions = [];
            if (eventDogRegistrations.size > 0) {
                queryConditions.push({
                    'dogs.nzfssNo': { $in: Array.from(eventDogRegistrations) }
                });
            }
            if (eventDogIds.size > 0) {
                queryConditions.push({
                    'dogs.dogId': { $in: Array.from(eventDogIds) }
                });
            }
            const mushers = await musher_model_1.MusherModel.find({
                $or: queryConditions
            })
                .populate('club')
                .lean();
            const validMushers = mushers.filter(musher => musher.club);
            return validMushers.map(musher => this.transformMusherDocument(musher));
        }
        catch (error) {
            console.error("Error fetching mushers for event:", error);
            throw new apollo_server_1.ApolloError(`Failed to fetch mushers for event: ${error.message}`);
        }
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => musher_schema_1.Musher),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [musher_schema_1.CreateMusherInput, Object]),
    __metadata("design:returntype", Promise)
], MusherResolver.prototype, "createMusher", null);
__decorate([
    (0, type_graphql_1.Query)(() => [musher_schema_1.Musher], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("clubId", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MusherResolver.prototype, "getMushers", null);
__decorate([
    (0, type_graphql_1.Query)(() => [musher_schema_1.Musher], { nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MusherResolver.prototype, "getMusherRegistrations", null);
__decorate([
    (0, type_graphql_1.Query)(() => [musher_schema_1.Musher], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("clubId", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MusherResolver.prototype, "getClubMushers", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => musher_schema_1.Musher),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.ID)),
    __param(1, (0, type_graphql_1.Arg)("input", () => musher_schema_1.UpdateMusherInput)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, musher_schema_1.UpdateMusherInput, Object]),
    __metadata("design:returntype", Promise)
], MusherResolver.prototype, "updateMusher", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.ID)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MusherResolver.prototype, "deleteMusher", null);
__decorate([
    (0, type_graphql_1.Query)(() => [musher_schema_1.Musher], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("surname", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("nzfssRegistrationNumber", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MusherResolver.prototype, "checkDuplicateMusher", null);
__decorate([
    (0, type_graphql_1.Query)(() => [musher_schema_1.Musher], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("eventId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MusherResolver.prototype, "getMushersForEvent", null);
MusherResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], MusherResolver);
exports.default = MusherResolver;
//# sourceMappingURL=musher.resolver.js.map