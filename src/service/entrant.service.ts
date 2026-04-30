import { ApolloError } from "apollo-server";
import { logger } from "../utils/logger";
import {
  CreateEntrantInput,
  EntrantModel,
  FindEntrantByIdInput,
  UpdateEntrantInput,
} from "../schema/entrants.schema";
import { LogService } from "./log.service";
import { EventCalendarModel } from "../schema/calendar.schema";
import { Context } from "../types/context";

export class EntrantService {
  constructor(private logService: LogService) {
    this.logService = new LogService();
  }
  async createEntrant(input: CreateEntrantInput, userId?: string) {
    try {
      // Check for existing entry with same driver name and class
      // For heated races, also check the heat to allow same musher in different heats
      const searchCriteria: any = {
        name: input.name,
        class: input.class,
        customClass: input.customClass || "",
        eventId: input.eventId
      };
      
      // For heated races, include heat in the search criteria
      if (input.raceFormat === 'Heated' && input.heat) {
        searchCriteria.heat = input.heat;
      }
      
      const existingEntry = await EntrantModel.findOne(searchCriteria);

      // Helper to compare two dog arrays (order-agnostic)
      const areDogsEqual = (dogsA: typeof input.associatedDog, dogsB: typeof input.associatedDog): boolean => {
        if (!Array.isArray(dogsA) || !Array.isArray(dogsB)) return false;
        if (dogsA.length !== dogsB.length) return false;
        const key = (d: any) => `${d.name?.toLowerCase() || ''}|${(d.NZFSSRegistration || '').toLowerCase()}`;
        const setA = dogsA.map(key).sort().join(',');
        const setB = dogsB.map(key).sort().join(',');
        return setA === setB;
      };

      if (existingEntry) {
        // Only update if the dog set matches exactly; otherwise proceed to create a new entrant
        if (!areDogsEqual(existingEntry.associatedDog as any, input.associatedDog)) {
          console.log(`[createEntrant] Found entrant with same name/class/heat but different dogs. Creating separate entrant.`);
        } else {
        // Process heat data for heated race format
        if (input.raceFormat === 'Heated') {
          console.log(`[createEntrant] Processing heated race update with selected heat: ${input.heat}`);
          
          // Ensure heat is set if heatsData is provided
          if (input.heatsData && input.heatsData.length > 0 && !input.heat) {
            input.heat = input.heatsData[0].heat;
            console.log(`[createEntrant] No heat specified, defaulting to first heat: ${input.heat}`);
          }
          
          // Update temperature and distance based on the selected heat
          if (input.heat && input.heatsData && input.heatsData.length > 0) {
            const selectedHeatData = input.heatsData.find(h => h.heat === input.heat);
            if (selectedHeatData) {
              console.log(`[createEntrant] Using data from selected heat: ${input.heat}, temp=${selectedHeatData.temperature}, distance=${selectedHeatData.distance}`);
              
              // Update temperature and distance fields to match the selected heat
              input.temperature = selectedHeatData.temperature;
              input.distance = selectedHeatData.distance;
            }
          }
        }
        
        // Update the existing entrant with the new race status and time
        const updatedEntrant = await EntrantModel.findByIdAndUpdate(
          existingEntry._id,
          {
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
          },
          { new: true }
        );

          if (!updatedEntrant) {
            throw new ApolloError("Failed to update existing entrant");
          }

          return updatedEntrant;
        }
      }

      // Validate required fields
      if (!input.name || !input.class || !input.eventId) {
        throw new ApolloError(
          "Missing required fields: name, class, and eventId are required",
          "VALIDATION_ERROR",
          {
            code: "VALIDATION_ERROR",
            details: {
              missingFields: [
                !input.name && "name",
                !input.class && "class",
                !input.eventId && "eventId"
              ].filter(Boolean)
            }
          }
        );
      }

      // Validate associated dogs
      if (!input.associatedDog || input.associatedDog.length === 0) {
        throw new ApolloError(
          "At least one dog must be associated with the entrant",
          "VALIDATION_ERROR",
          {
            code: "VALIDATION_ERROR",
            details: {
              field: "associatedDog",
              message: "At least one dog is required"
            }
          }
        );
      }

      // Process heat data for new heated race entries
      if (input.raceFormat === 'Heated') {
        console.log(`[createEntrant] Processing new heated race with selected heat: ${input.heat}`);
        
        // Ensure heat is set if heatsData is provided
        if (input.heatsData && input.heatsData.length > 0 && !input.heat) {
          input.heat = input.heatsData[0].heat;
          console.log(`[createEntrant] No heat specified for new entry, defaulting to first heat: ${input.heat}`);
        }
        
        // Update temperature and distance based on the selected heat
        if (input.heat && input.heatsData && input.heatsData.length > 0) {
          const selectedHeatData = input.heatsData.find(h => h.heat === input.heat);
          if (selectedHeatData) {
            console.log(`[createEntrant] Using data from selected heat for new entry: ${input.heat}, temp=${selectedHeatData.temperature}, distance=${selectedHeatData.distance}`);
            
            // Update temperature and distance fields to match the selected heat
            input.temperature = selectedHeatData.temperature;
            input.distance = selectedHeatData.distance;
          }
        }
      }

      // Process heatsData if provided
      if (input.heatsData && input.heatsData.length > 0) {
        console.log(`Creating entrant with ${input.heatsData.length} heat data records`);
      }

      console.log("Creating new entrant with input:", input);
      const newEntrant = await EntrantModel.create({...input, userId});
      return newEntrant;
    } catch (error) {
      // If it's already an ApolloError, just throw it
      if (error instanceof ApolloError) {
        throw error;
      }

      // Log the error for debugging
      logger.error("Error creating entrant:", error);

      // Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        throw new ApolloError(
          "A duplicate entry was detected. This driver may already be registered in this class.",
          "DUPLICATE_ENTRY",
          {
            code: "DUPLICATE_ENTRY",
            details: {
              message: "Duplicate key error",
              field: Object.keys(error.keyPattern || {})[0]
            }
          }
        );
      }

      // Handle validation errors
      if (error.name === "ValidationError") {
        throw new ApolloError(
          "Validation error occurred while creating the entrant",
          "VALIDATION_ERROR",
          {
            code: "VALIDATION_ERROR",
            details: error.errors
          }
        );
      }

      // For any other unexpected errors
      throw new ApolloError(
        "An unexpected error occurred while creating the entrant",
        "INTERNAL_SERVER_ERROR",
        {
          code: "INTERNAL_SERVER_ERROR",
          details: {
            message: error.message
          }
        }
      );
    }
  }

  async getAllEntrants(user: Context["user"]) {
    try {
      // Allow public access for weightpull points page
      let entrants = [];
      
      if (!user) {
        // Public access - return all entrants for weightpull points calculation
        entrants = await EntrantModel.find().lean();
      } else if (user.role === "ADMIN") {
        // Admin access - return all entrants
        entrants = await EntrantModel.find().lean();
      } else {
        // Club user access - return only their club's entrants
        const userClubEvents = await EventCalendarModel.find({ clubId: user._id }).lean();
        const userClubEventIds = userClubEvents.map(event => event._id);
        entrants = await EntrantModel.find({ eventId: { $in: userClubEventIds } }).lean();
      }

      // Populate event data for each entrant
      const eventCache = new Map();
      const populatedEntrants = await Promise.all(
        entrants.map(async (entrant) => {
          // Check cache first
          if (!eventCache.has(entrant.eventId)) {
            const event = await EventCalendarModel.findById(entrant.eventId).lean();
            if (event) {
              eventCache.set(entrant.eventId, event);
            }
          }
          
          // Add event data to entrant
          return {
            ...entrant,
            event: eventCache.get(entrant.eventId) || null
          };
        })
      );
      
      return populatedEntrants;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async findEntrantById(input: FindEntrantByIdInput) {
    const error = " Entrant with the given Id does not exist";
    try {
      const entrant = await EntrantModel.findById(input._id).lean();
      if (!entrant) {
        throw new ApolloError(error);
      }
      return entrant;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Internal sever error ");
    }
  }

  async updateEntrant(
    input: UpdateEntrantInput,
    entrantId: string,
    userId: string
  ) {
    try {
      // First find the existing entrant
      const oldEntrant = await EntrantModel.findById(entrantId);
      if (!oldEntrant) {
        throw new ApolloError("Entrant not found");
      }

      // Check for existing entry with same driver name and class (excluding current entrant)
      const existingEntry = await EntrantModel.findOne({
        name: input.name,
        class: input.class,
        customClass: input.customClass || "",
        eventId: oldEntrant.eventId,
        _id: { $ne: entrantId } // Exclude current entrant from check
      });

      // Process heat data for heated race format
      if (input.raceFormat === 'Heated') {
        console.log(`[updateEntrant] Processing heated race with selected heat: ${input.heat}`);
        
        // Ensure heat is set if heatsData is provided
        if (input.heatsData && input.heatsData.length > 0 && !input.heat) {
          input.heat = input.heatsData[0].heat;
          console.log(`[updateEntrant] No heat specified, defaulting to first heat: ${input.heat}`);
        }
        
        // Update temperature and distance based on the selected heat
        if (input.heat && input.heatsData && input.heatsData.length > 0) {
          const selectedHeatData = input.heatsData.find(h => h.heat === input.heat);
          if (selectedHeatData) {
            console.log(`[updateEntrant] Using data from selected heat: ${input.heat}, temp=${selectedHeatData.temperature}, distance=${selectedHeatData.distance}`);
            
            // Update temperature and distance fields to match the selected heat
            input.temperature = selectedHeatData.temperature;
            input.distance = selectedHeatData.distance;
          }
        }
      }

      if (existingEntry) {
        // Instead of throwing an error, update the existing entry
        const updatedEntrant = await EntrantModel.findByIdAndUpdate(
          existingEntry._id,
          { $set: input },
          { new: true }
        );

        if (!updatedEntrant) {
          throw new ApolloError("Failed to update existing entrant");
        }

        // Get the changes for logging
        const changes = {
          oldData: existingEntry.toObject(),
          newData: updatedEntrant.toObject()
        };

        // Log the changes
        await this.logService.logUpdate(
          userId,
          "entrant",
          existingEntry._id,
          changes.oldData,
          changes.newData
        );

        return updatedEntrant;
      }

      // If no existing entry found, update the original entrant
      const updatedEntrant = await EntrantModel.findByIdAndUpdate(
        entrantId,
        { $set: input },
        { new: true }
      );

      if (!updatedEntrant) {
        throw new ApolloError("Failed to update entrant");
      }

      // Get the changes for logging
      const changes = {
        oldData: oldEntrant.toObject(),
        newData: updatedEntrant.toObject()
      };

      // Log the changes
      await this.logService.logUpdate(
        userId,
        "entrant",
        entrantId,
        changes.oldData,
        changes.newData
      );

      return updatedEntrant;

    } catch (error) {
      logger.error("Error updating entrant:", error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async deleteEntrant( entrantId: string) {
    try {
      const deletedEntrant = await EntrantModel.findByIdAndDelete(
        entrantId
      ).lean();

      if (!deletedEntrant) {
        throw new ApolloError("Entrant with this id not found");
      }

      return deletedEntrant;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }

  async deleteEntrantsByEventId(eventId: string) {
    try {
      // First, get all entrants for this event to get their IDs
      const entrants = await EntrantModel.find({ eventId }).lean();
      const entrantIds = entrants.map(entrant => entrant._id.toString());
      
      let deletedPointsCount = 0;
      
      if (entrantIds.length > 0) {
        // Delete associated points first
        const { PointModel } = await import('../schema/point.schema');
        
        // Get count before deletion
        deletedPointsCount = await PointModel.countDocuments({ 
          entrantId: { $in: entrantIds } 
        });
        
        const deletedPoints = await PointModel.deleteMany({ 
          entrantId: { $in: entrantIds } 
        });
        
        logger.info(`Deleted ${deletedPoints.deletedCount} points for ${entrantIds.length} entrants`);
      }
      
      // Then delete the entrants
      const deletedEntrants = await EntrantModel.deleteMany({ eventId }).lean();
      
      logger.info(`Deleted ${deletedEntrants.deletedCount} entrants for event ${eventId}`);
      
      return {
        deletedEntrantsCount: deletedEntrants.deletedCount,
        deletedPointsCount: deletedPointsCount,
        acknowledged: deletedEntrants.acknowledged
      };
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  private getChanges(oldData: any, newData: any) {
    const changes: any = {
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

  async findEntrantsByEventId(eventId: string) {
    try {
      const entrants = await EntrantModel.find({ eventId }).lean();
      return entrants;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

}
