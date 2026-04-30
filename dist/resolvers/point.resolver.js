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
exports.PointResolver = void 0;
const type_graphql_1 = require("type-graphql");
const point_schema_1 = require("../schema/point.schema");
const entrants_schema_1 = require("../schema/entrants.schema");
const mongoose_1 = require("mongoose");
let PointResolver = class PointResolver {
    async getPoints(entrantId) {
        try {
            const point = await point_schema_1.PointModel.findOne({ entrantId: new mongoose_1.Types.ObjectId(entrantId) });
            if (!point)
                return null;
            const entrant = await entrants_schema_1.EntrantModel.findById(point.entrantId).populate('associatedDog').lean();
            return {
                _id: point._id.toString(),
                entrantId: point.entrantId.toString(),
                points: point.points,
                cutoffTime: point.cutoffTime || null,
                createdAt: point.createdAt || new Date(),
                updatedAt: point.updatedAt || new Date(),
                entrant: entrant ? this.convertToEntrantsType(entrant) : undefined
            };
        }
        catch (error) {
            console.error("Error fetching points:", error);
            throw new Error("Failed to fetch points");
        }
    }
    async getAllPoints() {
        try {
            const points = await point_schema_1.PointModel.find({});
            const entrants = await entrants_schema_1.EntrantModel.find({
                _id: { $in: points.map(p => p.entrantId) }
            }).populate('associatedDog').lean();
            const entrantMap = new Map();
            entrants.forEach(entrant => {
                entrantMap.set(entrant._id.toString(), entrant);
            });
            return points.map(point => {
                const entrant = entrantMap.get(point.entrantId.toString());
                return {
                    _id: point._id.toString(),
                    entrantId: point.entrantId.toString(),
                    points: point.points,
                    cutoffTime: point.cutoffTime || null,
                    dogPoints: point.dogPoints || [],
                    heatsData: this.convertHeatsData(point.heatsData),
                    createdAt: point.createdAt || new Date(),
                    updatedAt: point.updatedAt || new Date(),
                    entrant: entrant ? this.convertToEntrantsType(entrant) : undefined
                };
            });
        }
        catch (error) {
            console.error("Error fetching all points:", error);
            throw new Error("Failed to fetch points");
        }
    }
    async getPointsByEventId(eventId) {
        try {
            console.log(`=== getPointsByEventId called with eventId: ${eventId} ===`);
            const entrants = await entrants_schema_1.EntrantModel.find({
                $or: [
                    { eventId: eventId },
                    { eventId: new mongoose_1.Types.ObjectId(eventId) }
                ]
            }).populate('associatedDog').lean();
            console.log(`Found ${entrants.length} entrants for event ${eventId}`);
            console.log(`Entrant IDs: ${entrants.map(e => e._id.toString())}`);
            if (entrants.length === 0) {
                console.log("No entrants found for this event - returning empty array");
                return [];
            }
            const entrantIds = entrants.map(e => e._id);
            console.log(`Looking for points with entrant IDs: ${entrantIds.map(id => id.toString())}`);
            const points = await point_schema_1.PointModel.find({
                entrantId: { $in: entrantIds }
            }).lean();
            console.log(`Found ${points.length} points for these entrants`);
            console.log(`Point entrant IDs: ${points.map(p => p.entrantId.toString())}`);
            if (points.length === 0) {
                console.log("No points found for these entrants - returning empty array");
                return [];
            }
            const entrantMap = new Map();
            entrants.forEach(entrant => {
                entrantMap.set(entrant._id.toString(), entrant);
            });
            const formattedResult = [];
            for (const point of points) {
                try {
                    const entrant = entrantMap.get(point.entrantId.toString());
                    if (!entrant) {
                        console.warn(`No entrant found for point with entrantId: ${point.entrantId}`);
                        continue;
                    }
                    const formattedPoint = {
                        _id: point._id.toString(),
                        entrantId: point.entrantId.toString(),
                        points: point.points,
                        cutoffTime: point.cutoffTime || null,
                        dogPoints: point.dogPoints || [],
                        heatsData: this.convertHeatsData(point.heatsData),
                        createdAt: point.createdAt || new Date(),
                        updatedAt: point.updatedAt || new Date(),
                        entrant: this.convertToEntrantsType(entrant)
                    };
                    formattedResult.push(formattedPoint);
                    console.log(`Successfully formatted point for ${entrant.name} with ${point.points} points`);
                }
                catch (formatError) {
                    console.error(`Error formatting point ${point._id}:`, formatError);
                    continue;
                }
            }
            console.log(`=== Returning ${formattedResult.length} formatted points ===`);
            return formattedResult;
        }
        catch (error) {
            console.error("Error in getPointsByEventId:", error);
            throw new Error(`Failed to fetch points: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async submitPoints(points) {
        try {
            console.log(`Received points submission request for ${points.length} entries`);
            if (!points || !Array.isArray(points) || points.length === 0) {
                throw new Error("No points data provided");
            }
            await this.cleanupDuplicateHeatsData();
            const validatedPoints = [];
            const errors = [];
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                if (!point.entrantId || typeof point.entrantId !== 'string') {
                    errors.push(`Entry ${i + 1}: Invalid entrant ID`);
                    continue;
                }
                if (typeof point.points !== 'number' || isNaN(point.points) || point.points < 0) {
                    errors.push(`Entry ${i + 1}: Invalid points value (${point.points})`);
                    continue;
                }
                if (!Array.isArray(point.dogPoints)) {
                    errors.push(`Entry ${i + 1}: Invalid dog points array`);
                    continue;
                }
                const validDogPoints = point.dogPoints.filter(dogPoint => {
                    return dogPoint &&
                        typeof dogPoint.NZFSSRegistration === 'string' &&
                        dogPoint.NZFSSRegistration.trim() !== '' &&
                        typeof dogPoint.points === 'number' &&
                        !isNaN(dogPoint.points) &&
                        dogPoint.points >= 0;
                });
                try {
                    const entrantExists = await entrants_schema_1.EntrantModel.findById(point.entrantId);
                    if (!entrantExists) {
                        errors.push(`Entry ${i + 1}: Entrant not found (${point.entrantId})`);
                        continue;
                    }
                }
                catch (entrantError) {
                    errors.push(`Entry ${i + 1}: Error validating entrant (${point.entrantId})`);
                    continue;
                }
                validatedPoints.push({
                    ...point,
                    dogPoints: validDogPoints
                });
            }
            if (errors.length > 0) {
                console.error("Validation errors:", errors);
                throw new Error(`Validation failed: ${errors.join('; ')}`);
            }
            if (validatedPoints.length === 0) {
                throw new Error("No valid points data to process");
            }
            console.log(`Processing ${validatedPoints.length} validated points entries`);
            const entrantIds = validatedPoints.map(p => p.entrantId);
            const existingPoints = await point_schema_1.PointModel.find({
                entrantId: { $in: entrantIds }
            });
            if (existingPoints.length > 0) {
                const duplicateIds = existingPoints.map(p => p.entrantId.toString());
                console.warn(`Found existing points for entrants: ${duplicateIds.join(', ')}`);
                await point_schema_1.PointModel.deleteMany({
                    entrantId: { $in: duplicateIds }
                });
            }
            const pointsToCreate = await Promise.all(validatedPoints.map(async (point) => {
                let heatsData = point.heatsData || [];
                if (!heatsData || heatsData.length === 0) {
                    const entrant = await entrants_schema_1.EntrantModel.findById(point.entrantId);
                    heatsData = entrant?.heatsData || [];
                }
                const uniqueHeats = new Map();
                heatsData.forEach((heat) => {
                    const key = `${heat.heat}-${heat.temperature}-${heat.distance}-${heat.class}`;
                    uniqueHeats.set(key, heat);
                });
                const deduplicatedHeatsData = Array.from(uniqueHeats.values());
                console.log(`Point submission for entrant ${point.entrantId}: heatsData ${heatsData.length} -> ${deduplicatedHeatsData.length} after deduplication`);
                return {
                    entrantId: new mongoose_1.Types.ObjectId(point.entrantId),
                    points: point.points,
                    cutoffTime: point.cutoffTime || null,
                    dogPoints: point.dogPoints || [],
                    heatsData: deduplicatedHeatsData,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            }));
            const createdPoints = await point_schema_1.PointModel.insertMany(pointsToCreate);
            console.log(`Successfully created ${createdPoints.length} point entries`);
            const entrantUpdatePromises = validatedPoints.map(async (point) => {
                try {
                    const updateData = {
                        points: point.points,
                        updatedAt: new Date(),
                    };
                    if (point.cutoffTime) {
                        updateData.cutoffTime = point.cutoffTime;
                    }
                    if (point.heatsData && point.heatsData.length > 0) {
                        const uniqueHeats = new Map();
                        point.heatsData.forEach((heat) => {
                            const key = `${heat.heat}-${heat.temperature}-${heat.distance}-${heat.class}`;
                            uniqueHeats.set(key, heat);
                        });
                        updateData.heatsData = Array.from(uniqueHeats.values());
                    }
                    return await entrants_schema_1.EntrantModel.findByIdAndUpdate(point.entrantId, { $set: updateData }, { new: true });
                }
                catch (updateError) {
                    console.error(`Error updating entrant ${point.entrantId}:`, updateError);
                    throw updateError;
                }
            });
            await Promise.all(entrantUpdatePromises);
            console.log(`Successfully updated ${validatedPoints.length} entrants`);
            return {
                success: true,
                message: `Successfully submitted points for ${validatedPoints.length} entrants`,
                points: createdPoints.map(point => ({
                    _id: point._id.toString(),
                    entrantId: point.entrantId.toString(),
                    points: point.points,
                    cutoffTime: point.cutoffTime,
                    dogPoints: point.dogPoints || [],
                    heatsData: this.convertHeatsData(point.heatsData),
                    createdAt: point.createdAt || new Date(),
                    updatedAt: point.updatedAt || new Date()
                })),
            };
        }
        catch (error) {
            console.error("Error submitting points:", error);
            let errorMessage = "Failed to submit points";
            if (error instanceof Error) {
                if (error.message.includes("Validation failed")) {
                    errorMessage = error.message;
                }
                else if (error.message.includes("duplicate")) {
                    errorMessage = "Duplicate points submission detected";
                }
                else if (error.message.includes("not found")) {
                    errorMessage = "One or more entrants not found";
                }
                else {
                    errorMessage = `Database error: ${error.message}`;
                }
            }
            throw new Error(errorMessage);
        }
    }
    convertHeatsData(heatsData) {
        try {
            if (!heatsData) {
                console.log("convertHeatsData: No heatsData provided");
                return [];
            }
            if (Array.isArray(heatsData) && !heatsData.toObject) {
                console.log("convertHeatsData: Processing plain array");
                return heatsData.filter((heat) => heat &&
                    typeof heat.heat === 'string' &&
                    typeof heat.temperature === 'string' &&
                    typeof heat.distance === 'string' &&
                    typeof heat.class === 'string');
            }
            const array = heatsData.toObject ? heatsData.toObject() : heatsData;
            if (!Array.isArray(array)) {
                console.log("convertHeatsData: Not an array after conversion");
                return [];
            }
            console.log("convertHeatsData: Processing Mongoose array");
            return array.filter((heat) => heat &&
                typeof heat.heat === 'string' &&
                typeof heat.temperature === 'string' &&
                typeof heat.distance === 'string' &&
                typeof heat.class === 'string');
        }
        catch (error) {
            console.error("Error in convertHeatsData:", error);
            return [];
        }
    }
    convertToEntrantsType(entrant) {
        try {
            const entrantObj = entrant.toObject ? entrant.toObject() : entrant;
            console.log(`convertToEntrantsType: Converting entrant ${entrantObj.name}`);
            return {
                _id: entrantObj._id.toString(),
                name: entrantObj.name,
                raceFormat: entrantObj.raceFormat,
                class: entrantObj.class,
                customClass: entrantObj.customClass,
                associatedDog: entrantObj.associatedDog || [],
                raceType: entrantObj.raceType,
                startTime: entrantObj.startTime || null,
                raceTime: entrantObj.raceTime || null,
                cutoffTime: entrantObj.cutoffTime || null,
                userId: entrantObj.userId?.toString(),
                eventId: entrantObj.eventId?.toString(),
                temperature: entrantObj.temperature || "",
                distance: entrantObj.distance || "",
                heat: entrantObj.heat || null,
                heatsData: this.convertHeatsData(entrantObj.heatsData),
                dogWeight: entrantObj.dogWeight || null,
                weightPulled: entrantObj.weightPulled || null,
                createdAt: entrantObj.createdAt || new Date()
            };
        }
        catch (error) {
            console.error("Error in convertToEntrantsType:", error);
            throw error;
        }
    }
    async cleanupDuplicateHeatsData() {
        try {
            console.log("Starting cleanup of duplicate heatsData...");
            const points = await point_schema_1.PointModel.find({ "heatsData.0": { $exists: true } }).lean();
            const pointUpdates = [];
            for (const point of points) {
                if (point.heatsData && point.heatsData.length > 0) {
                    const uniqueHeats = new Map();
                    point.heatsData.forEach((heat) => {
                        const key = `${heat.heat}-${heat.temperature}-${heat.distance}-${heat.class}`;
                        uniqueHeats.set(key, heat);
                    });
                    const deduplicatedHeatsData = Array.from(uniqueHeats.values());
                    if (deduplicatedHeatsData.length < point.heatsData.length) {
                        pointUpdates.push({
                            updateOne: {
                                filter: { _id: point._id },
                                update: { $set: { heatsData: deduplicatedHeatsData } }
                            }
                        });
                    }
                }
            }
            if (pointUpdates.length > 0) {
                await point_schema_1.PointModel.bulkWrite(pointUpdates);
                console.log(`Cleaned up duplicate heatsData in ${pointUpdates.length} point records`);
            }
            const { EntrantModel } = await Promise.resolve().then(() => __importStar(require('../schema/entrants.schema')));
            const entrants = await EntrantModel.find({ "heatsData.0": { $exists: true } }).lean();
            const entrantUpdates = [];
            for (const entrant of entrants) {
                if (entrant.heatsData && entrant.heatsData.length > 0) {
                    const uniqueHeats = new Map();
                    entrant.heatsData.forEach((heat) => {
                        const key = `${heat.heat}-${heat.temperature}-${heat.distance}-${heat.class}`;
                        uniqueHeats.set(key, heat);
                    });
                    const deduplicatedHeatsData = Array.from(uniqueHeats.values());
                    if (deduplicatedHeatsData.length < entrant.heatsData.length) {
                        entrantUpdates.push({
                            updateOne: {
                                filter: { _id: entrant._id },
                                update: { $set: { heatsData: deduplicatedHeatsData } }
                            }
                        });
                    }
                }
            }
            if (entrantUpdates.length > 0) {
                await EntrantModel.bulkWrite(entrantUpdates);
                console.log(`Cleaned up duplicate heatsData in ${entrantUpdates.length} entrant records`);
            }
            console.log("Cleanup of duplicate heatsData completed");
        }
        catch (error) {
            console.error("Error during heatsData cleanup:", error);
        }
    }
};
exports.PointResolver = PointResolver;
__decorate([
    (0, type_graphql_1.Query)(() => point_schema_1.Point, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("entrantId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PointResolver.prototype, "getPoints", null);
__decorate([
    (0, type_graphql_1.Query)(() => [point_schema_1.Point]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PointResolver.prototype, "getAllPoints", null);
__decorate([
    (0, type_graphql_1.Query)(() => [point_schema_1.Point]),
    __param(0, (0, type_graphql_1.Arg)("eventId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PointResolver.prototype, "getPointsByEventId", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => point_schema_1.SubmitPointsResponse),
    __param(0, (0, type_graphql_1.Arg)("points", () => [point_schema_1.PointsInput])),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], PointResolver.prototype, "submitPoints", null);
exports.PointResolver = PointResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], PointResolver);
//# sourceMappingURL=point.resolver.js.map