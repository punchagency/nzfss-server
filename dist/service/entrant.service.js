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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntrantService = void 0;
const apollo_server_1 = require("apollo-server");
const logger_1 = require("../utils/logger");
const entrants_schema_1 = require("../schema/entrants.schema");
const log_service_1 = require("./log.service");
const calendar_schema_1 = require("../schema/calendar.schema");
class EntrantService {
    constructor(logService) {
        this.logService = logService;
        this.logService = new log_service_1.LogService();
    }
    async createEntrant(input, userId) {
        try {
            const searchCriteria = {
                name: input.name,
                class: input.class,
                customClass: input.customClass || "",
                eventId: input.eventId
            };
            if (input.raceFormat === 'Heated' && input.heat) {
                searchCriteria.heat = input.heat;
            }
            const existingEntry = await entrants_schema_1.EntrantModel.findOne(searchCriteria);
            const areDogsEqual = (dogsA, dogsB) => {
                if (!Array.isArray(dogsA) || !Array.isArray(dogsB))
                    return false;
                if (dogsA.length !== dogsB.length)
                    return false;
                const key = (d) => `${d.name?.toLowerCase() || ''}|${(d.NZFSSRegistration || '').toLowerCase()}`;
                const setA = dogsA.map(key).sort().join(',');
                const setB = dogsB.map(key).sort().join(',');
                return setA === setB;
            };
            if (existingEntry) {
                if (!areDogsEqual(existingEntry.associatedDog, input.associatedDog)) {
                    console.log(`[createEntrant] Found entrant with same name/class/heat but different dogs. Creating separate entrant.`);
                }
                else {
                    if (input.raceFormat === 'Heated') {
                        console.log(`[createEntrant] Processing heated race update with selected heat: ${input.heat}`);
                        if (input.heatsData && input.heatsData.length > 0 && !input.heat) {
                            input.heat = input.heatsData[0].heat;
                            console.log(`[createEntrant] No heat specified, defaulting to first heat: ${input.heat}`);
                        }
                        if (input.heat && input.heatsData && input.heatsData.length > 0) {
                            const selectedHeatData = input.heatsData.find(h => h.heat === input.heat);
                            if (selectedHeatData) {
                                console.log(`[createEntrant] Using data from selected heat: ${input.heat}, temp=${selectedHeatData.temperature}, distance=${selectedHeatData.distance}`);
                                input.temperature = selectedHeatData.temperature;
                                input.distance = selectedHeatData.distance;
                            }
                        }
                    }
                    const updatedEntrant = await entrants_schema_1.EntrantModel.findByIdAndUpdate(existingEntry._id, {
                        $set: {
                            raceType: input.raceType,
                            raceTime: input.raceTime,
                            temperature: input.temperature,
                            distance: input.distance,
                            associatedDog: input.associatedDog,
                            heatsData: input.heatsData || [],
                            heat: input.heat,
                            dogWeight: input.dogWeight,
                            weightPulled: input.weightPulled
                        }
                    }, { new: true });
                    if (!updatedEntrant) {
                        throw new apollo_server_1.ApolloError("Failed to update existing entrant");
                    }
                    return updatedEntrant;
                }
            }
            if (!input.name || !input.class || !input.eventId) {
                throw new apollo_server_1.ApolloError("Missing required fields: name, class, and eventId are required", "VALIDATION_ERROR", {
                    code: "VALIDATION_ERROR",
                    details: {
                        missingFields: [
                            !input.name && "name",
                            !input.class && "class",
                            !input.eventId && "eventId"
                        ].filter(Boolean)
                    }
                });
            }
            if (!input.associatedDog || input.associatedDog.length === 0) {
                throw new apollo_server_1.ApolloError("At least one dog must be associated with the entrant", "VALIDATION_ERROR", {
                    code: "VALIDATION_ERROR",
                    details: {
                        field: "associatedDog",
                        message: "At least one dog is required"
                    }
                });
            }
            if (input.raceFormat === 'Heated') {
                console.log(`[createEntrant] Processing new heated race with selected heat: ${input.heat}`);
                if (input.heatsData && input.heatsData.length > 0 && !input.heat) {
                    input.heat = input.heatsData[0].heat;
                    console.log(`[createEntrant] No heat specified for new entry, defaulting to first heat: ${input.heat}`);
                }
                if (input.heat && input.heatsData && input.heatsData.length > 0) {
                    const selectedHeatData = input.heatsData.find(h => h.heat === input.heat);
                    if (selectedHeatData) {
                        console.log(`[createEntrant] Using data from selected heat for new entry: ${input.heat}, temp=${selectedHeatData.temperature}, distance=${selectedHeatData.distance}`);
                        input.temperature = selectedHeatData.temperature;
                        input.distance = selectedHeatData.distance;
                    }
                }
            }
            if (input.heatsData && input.heatsData.length > 0) {
                console.log(`Creating entrant with ${input.heatsData.length} heat data records`);
            }
            console.log("Creating new entrant with input:", input);
            const newEntrant = await entrants_schema_1.EntrantModel.create({ ...input, userId });
            return newEntrant;
        }
        catch (error) {
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            logger_1.logger.error("Error creating entrant:", error);
            if (error.code === 11000) {
                throw new apollo_server_1.ApolloError("A duplicate entry was detected. This driver may already be registered in this class.", "DUPLICATE_ENTRY", {
                    code: "DUPLICATE_ENTRY",
                    details: {
                        message: "Duplicate key error",
                        field: Object.keys(error.keyPattern || {})[0]
                    }
                });
            }
            if (error.name === "ValidationError") {
                throw new apollo_server_1.ApolloError("Validation error occurred while creating the entrant", "VALIDATION_ERROR", {
                    code: "VALIDATION_ERROR",
                    details: error.errors
                });
            }
            throw new apollo_server_1.ApolloError("An unexpected error occurred while creating the entrant", "INTERNAL_SERVER_ERROR", {
                code: "INTERNAL_SERVER_ERROR",
                details: {
                    message: error.message
                }
            });
        }
    }
    async getAllEntrants(user) {
        try {
            let entrants = [];
            if (!user) {
                entrants = await entrants_schema_1.EntrantModel.find().lean();
            }
            else if (user.role === "ADMIN") {
                entrants = await entrants_schema_1.EntrantModel.find().lean();
            }
            else {
                const userClubEvents = await calendar_schema_1.EventCalendarModel.find({ clubId: user._id }).lean();
                const userClubEventIds = userClubEvents.map(event => event._id);
                entrants = await entrants_schema_1.EntrantModel.find({ eventId: { $in: userClubEventIds } }).lean();
            }
            const eventCache = new Map();
            const populatedEntrants = await Promise.all(entrants.map(async (entrant) => {
                if (!eventCache.has(entrant.eventId)) {
                    const event = await calendar_schema_1.EventCalendarModel.findById(entrant.eventId).lean();
                    if (event) {
                        eventCache.set(entrant.eventId, event);
                    }
                }
                return {
                    ...entrant,
                    event: eventCache.get(entrant.eventId) || null
                };
            }));
            return populatedEntrants;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async findEntrantById(input) {
        const error = " Entrant with the given Id does not exist";
        try {
            const entrant = await entrants_schema_1.EntrantModel.findById(input._id).lean();
            if (!entrant) {
                throw new apollo_server_1.ApolloError(error);
            }
            return entrant;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async updateEntrant(input, entrantId, userId) {
        try {
            const oldEntrant = await entrants_schema_1.EntrantModel.findById(entrantId);
            if (!oldEntrant) {
                throw new apollo_server_1.ApolloError("Entrant not found");
            }
            const existingEntry = await entrants_schema_1.EntrantModel.findOne({
                name: input.name,
                class: input.class,
                customClass: input.customClass || "",
                eventId: oldEntrant.eventId,
                _id: { $ne: entrantId }
            });
            if (input.raceFormat === 'Heated') {
                console.log(`[updateEntrant] Processing heated race with selected heat: ${input.heat}`);
                if (input.heatsData && input.heatsData.length > 0 && !input.heat) {
                    input.heat = input.heatsData[0].heat;
                    console.log(`[updateEntrant] No heat specified, defaulting to first heat: ${input.heat}`);
                }
                if (input.heat && input.heatsData && input.heatsData.length > 0) {
                    const selectedHeatData = input.heatsData.find(h => h.heat === input.heat);
                    if (selectedHeatData) {
                        console.log(`[updateEntrant] Using data from selected heat: ${input.heat}, temp=${selectedHeatData.temperature}, distance=${selectedHeatData.distance}`);
                        input.temperature = selectedHeatData.temperature;
                        input.distance = selectedHeatData.distance;
                    }
                }
            }
            if (existingEntry) {
                const updatedEntrant = await entrants_schema_1.EntrantModel.findByIdAndUpdate(existingEntry._id, { $set: input }, { new: true });
                if (!updatedEntrant) {
                    throw new apollo_server_1.ApolloError("Failed to update existing entrant");
                }
                const changes = {
                    oldData: existingEntry.toObject(),
                    newData: updatedEntrant.toObject()
                };
                await this.logService.logUpdate(userId, "entrant", existingEntry._id, changes.oldData, changes.newData);
                return updatedEntrant;
            }
            const updatedEntrant = await entrants_schema_1.EntrantModel.findByIdAndUpdate(entrantId, { $set: input }, { new: true });
            if (!updatedEntrant) {
                throw new apollo_server_1.ApolloError("Failed to update entrant");
            }
            const changes = {
                oldData: oldEntrant.toObject(),
                newData: updatedEntrant.toObject()
            };
            await this.logService.logUpdate(userId, "entrant", entrantId, changes.oldData, changes.newData);
            return updatedEntrant;
        }
        catch (error) {
            logger_1.logger.error("Error updating entrant:", error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async deleteEntrant(entrantId) {
        try {
            const deletedEntrant = await entrants_schema_1.EntrantModel.findByIdAndDelete(entrantId).lean();
            if (!deletedEntrant) {
                throw new apollo_server_1.ApolloError("Entrant with this id not found");
            }
            return deletedEntrant;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async deleteEntrantsByEventId(eventId) {
        try {
            const entrants = await entrants_schema_1.EntrantModel.find({ eventId }).lean();
            const entrantIds = entrants.map(entrant => entrant._id.toString());
            let deletedPointsCount = 0;
            if (entrantIds.length > 0) {
                const { PointModel } = await Promise.resolve().then(() => __importStar(require('../schema/point.schema')));
                deletedPointsCount = await PointModel.countDocuments({
                    entrantId: { $in: entrantIds }
                });
                const deletedPoints = await PointModel.deleteMany({
                    entrantId: { $in: entrantIds }
                });
                logger_1.logger.info(`Deleted ${deletedPoints.deletedCount} points for ${entrantIds.length} entrants`);
            }
            const deletedEntrants = await entrants_schema_1.EntrantModel.deleteMany({ eventId }).lean();
            logger_1.logger.info(`Deleted ${deletedEntrants.deletedCount} entrants for event ${eventId}`);
            return {
                deletedEntrantsCount: deletedEntrants.deletedCount,
                deletedPointsCount: deletedPointsCount,
                acknowledged: deletedEntrants.acknowledged
            };
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    getChanges(oldData, newData) {
        const changes = {
            oldData: {},
            newData: {}
        };
        for (const key in newData) {
            if (newData[key] !== oldData[key]) {
                changes.oldData[key] = oldData[key];
                changes.newData[key] = newData[key];
            }
        }
        return changes;
    }
    async findEntrantsByEventId(eventId) {
        try {
            const entrants = await entrants_schema_1.EntrantModel.find({ eventId }).lean();
            return entrants;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
}
exports.EntrantService = EntrantService;
//# sourceMappingURL=entrant.service.js.map