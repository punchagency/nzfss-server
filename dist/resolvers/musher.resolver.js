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
const mongoose_1 = require("mongoose");
const club_schema_1 = require("../schema/club.schema");
let MusherResolver = class MusherResolver {
    transformMusherDocument(doc) {
        return {
            id: doc._id.toString(),
            name: doc.name,
            registrationNo: doc.registrationNo,
            kennelRegistrationNo: doc.kennelRegistrationNo,
            club: doc.club?._id?.toString() || doc.club?.toString() || null,
            dogs: doc.dogs.map((dog) => ({
                _id: dog._id?.toString() || new mongoose_1.Types.ObjectId().toString(),
                name: dog.name,
                pedigreeName: dog.pedigreeName,
                nzkcNo: dog.nzkcNo,
                nzfssNo: dog.nzfssNo,
                dateOfBirth: dog.dateOfBirth || dog.dob,
                breed: dog.breed,
                deceased: Boolean(dog.deceased)
            })),
            showProfileConsent: doc.showProfileConsent,
            createdAt: doc.createdAt || new Date(),
            updatedAt: doc.updatedAt || new Date()
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
            console.log("Incoming input:", JSON.stringify(input, null, 2));
            console.log("Incoming dogs:", JSON.stringify(input.dogs, null, 2));
            const processedDogs = input.dogs.map(dog => {
                const processedDog = {
                    name: dog.name || "",
                    pedigreeName: dog.pedigreeName || "",
                    nzkcNo: dog.nzkcNo || "",
                    nzfssNo: dog.nzfssNo || "",
                    dateOfBirth: dog.dob || dog.dateOfBirth || "",
                    breed: dog.breed || "",
                    deceased: Boolean(dog.deceased)
                };
                console.log("Processing dog:", JSON.stringify(processedDog, null, 2));
                return processedDog;
            });
            const musherData = {
                ...input,
                dogs: processedDogs,
                club: input.clubId,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            console.log("Final musher data:", JSON.stringify(musherData, null, 2));
            const musher = await musher_model_1.MusherModel.create({
                ...musherData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log("Saved musher:", JSON.stringify(musher.toObject(), null, 2));
            return musher;
        }
        catch (error) {
            console.error("Error creating musher:", error);
            throw new apollo_server_1.ApolloError(`Failed to create musher: ${error.message}`);
        }
    }
    async getMushers(context, clubId) {
        try {
            if (clubId) {
                console.log("Fetching mushers for club:", clubId);
                const mushers = await musher_model_1.MusherModel.find({ club: clubId })
                    .populate('club')
                    .lean();
                console.log(`Found ${mushers.length} mushers for club ${clubId}`);
                const validMushers = mushers.filter(musher => {
                    if (!musher.club) {
                        console.error(`Musher ${musher._id} has no club reference`);
                        return false;
                    }
                    return true;
                });
                if (validMushers.length < mushers.length) {
                    console.error(`Filtered out ${mushers.length - validMushers.length} mushers with invalid club references`);
                }
                return validMushers.map(musher => this.transformMusherDocument(musher));
            }
            console.log("Fetching all mushers");
            const mushers = await musher_model_1.MusherModel.find()
                .populate('club')
                .lean();
            console.log(`Found ${mushers.length} mushers in total`);
            const validMushers = mushers.filter(musher => {
                if (!musher.club) {
                    console.error(`Musher ${musher._id} has no club reference`);
                    return false;
                }
                return true;
            });
            if (validMushers.length < mushers.length) {
                console.error(`Filtered out ${mushers.length - validMushers.length} mushers with invalid club references`);
            }
            return validMushers.map(musher => this.transformMusherDocument(musher));
        }
        catch (error) {
            console.error("Error fetching mushers:", error);
            throw new apollo_server_1.ApolloError(`Failed to fetch mushers: ${error.message}`);
        }
    }
    async getClubMushers(context, clubId) {
        try {
            const targetClubId = clubId || context.user?._id;
            if (!targetClubId) {
                throw new apollo_server_1.ApolloError("No club ID provided and user not authenticated");
            }
            console.log("Fetching mushers for club:", targetClubId);
            const mushers = await musher_model_1.MusherModel.find({ club: targetClubId })
                .populate('club')
                .lean();
            console.log(`Found ${mushers.length} mushers for club ${targetClubId}`);
            const validMushers = mushers.filter(musher => {
                if (!musher.club) {
                    console.error(`Musher ${musher._id} has no club reference`);
                    return false;
                }
                return true;
            });
            if (validMushers.length < mushers.length) {
                console.error(`Filtered out ${mushers.length - validMushers.length} mushers with invalid club references`);
            }
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
            console.log("Updating musher. ID:", id);
            console.log("Update input:", JSON.stringify(input, null, 2));
            const existingMusher = await musher_model_1.MusherModel.findById(id);
            if (!existingMusher) {
                throw new apollo_server_1.ApolloError("Musher not found");
            }
            let processedDogs;
            if (input.dogs) {
                processedDogs = input.dogs.map(dog => ({
                    name: dog.name || "",
                    pedigreeName: dog.pedigreeName || "",
                    nzkcNo: dog.nzkcNo || "",
                    nzfssNo: dog.nzfssNo || "",
                    dateOfBirth: dog.dob || dog.dateOfBirth || "",
                    breed: dog.breed || "",
                    deceased: Boolean(dog.deceased)
                }));
            }
            const updateData = {
                ...input,
                ...(processedDogs && { dogs: processedDogs }),
                updatedAt: new Date()
            };
            console.log("Final update data:", JSON.stringify(updateData, null, 2));
            const updatedMusher = await musher_model_1.MusherModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
            if (!updatedMusher) {
                throw new apollo_server_1.ApolloError("Failed to update musher");
            }
            console.log("Updated musher:", JSON.stringify(updatedMusher.toObject(), null, 2));
            return updatedMusher;
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
            console.log("Deleting musher with ID:", id);
            const existingMusher = await musher_model_1.MusherModel.findOne({ _id: id });
            if (!existingMusher) {
                console.error("Musher not found with ID:", id);
                throw new apollo_server_1.ApolloError("Musher not found");
            }
            const result = await musher_model_1.MusherModel.findByIdAndDelete(id);
            if (!result) {
                console.error("Failed to delete musher with ID:", id);
                throw new apollo_server_1.ApolloError("Failed to delete musher");
            }
            console.log("Successfully deleted musher:", id);
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
            console.log(`Found ${duplicates.length} potential duplicate mushers for surname: ${surname}, registration: ${nzfssRegistrationNumber}`);
            return duplicates;
        }
        catch (error) {
            console.error("Error checking for duplicate mushers:", error);
            throw new apollo_server_1.ApolloError(`Failed to check for duplicate mushers: ${error.message}`);
        }
    }
    async getMushersForEvent(context, eventId) {
        try {
            console.log(`Fetching mushers for event: ${eventId}`);
            const { EntrantModel } = await Promise.resolve().then(() => __importStar(require("../schema/entrants.schema")));
            const entrants = await EntrantModel.find({ eventId: eventId })
                .populate('associatedDog')
                .lean();
            console.log(`Found ${entrants.length} entrants for event ${eventId}`);
            if (entrants.length === 0) {
                console.log(`No entrants found for event ${eventId}`);
                return [];
            }
            const eventDogRegistrations = new Set();
            entrants.forEach(entrant => {
                if (entrant.associatedDog && Array.isArray(entrant.associatedDog)) {
                    entrant.associatedDog.forEach(dog => {
                        if (dog.NZFSSRegistration && dog.NZFSSRegistration.trim() !== '') {
                            eventDogRegistrations.add(dog.NZFSSRegistration);
                        }
                    });
                }
            });
            console.log(`Found ${eventDogRegistrations.size} unique dog registrations in event`);
            if (eventDogRegistrations.size === 0) {
                console.log(`No dog registrations found in event ${eventId}`);
                return [];
            }
            const mushers = await musher_model_1.MusherModel.find({
                'dogs.nzfssNo': { $in: Array.from(eventDogRegistrations) }
            })
                .populate('club')
                .lean();
            console.log(`Found ${mushers.length} mushers with dogs participating in event ${eventId}`);
            const validMushers = mushers.filter(musher => {
                if (!musher.club) {
                    console.error(`Musher ${musher._id} has no club reference`);
                    return false;
                }
                return true;
            });
            if (validMushers.length < mushers.length) {
                console.error(`Filtered out ${mushers.length - validMushers.length} mushers with invalid club references`);
            }
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