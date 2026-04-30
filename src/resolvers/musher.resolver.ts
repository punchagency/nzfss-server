import { Resolver, Query, Mutation, Arg, Ctx, Authorized, ID } from "type-graphql";
import { Context } from "../types/context";
import { ApolloError } from "apollo-server";
import { MusherModel } from "../models/musher.model";
import { Musher, CreateMusherInput, UpdateMusherInput, DogInput } from "../schema/musher.schema";
import { Types } from "mongoose";
import { getModelForClass } from "@typegoose/typegoose";
import { Club, ClubModel } from "../schema/club.schema";

@Resolver()
export default class MusherResolver {
  private transformMusherDocument(doc: any): Musher {
    return {
      id: doc._id.toString(),
      name: doc.name,
      registrationNo: doc.registrationNo,
      kennelRegistrationNo: doc.kennelRegistrationNo,
      club: doc.club?._id?.toString() || doc.club?.toString() || null,
      dogs: doc.dogs.map((dog: any) => ({
        _id: dog._id?.toString() || new Types.ObjectId().toString(),
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
    } as Musher;
  }

  @Mutation(() => Musher)
  async createMusher(
    @Arg("input") input: CreateMusherInput,
    @Ctx() context: Context
  ): Promise<Musher> {
    if (!context.user?._id) {
      throw new ApolloError("User not authenticated");
    }
    
    try {
      // Validate club ID
      if (!input.clubId) {
        throw new ApolloError("Club ID is required");
      }

      // Verify club exists
      const club = await ClubModel.findById(input.clubId);
      if (!club) {
        throw new ApolloError("Invalid club ID: Club not found");
      }

      // Log incoming data
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
        
        // Log each processed dog
        console.log("Processing dog:", JSON.stringify(processedDog, null, 2));
        return processedDog;
      });

      const musherData = {
        ...input,
        dogs: processedDogs,
        club: input.clubId,  // Use the validated club ID
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Log final data before save
      console.log("Final musher data:", JSON.stringify(musherData, null, 2));

      const musher = await MusherModel.create({
        ...musherData,
        createdAt: new Date(),
        updatedAt: new Date()
      }) as unknown as Musher;
      
      // Log saved data
      console.log("Saved musher:", JSON.stringify((musher as any).toObject(), null, 2));
      
      return musher;
    } catch (error) {
      console.error("Error creating musher:", error);
      throw new ApolloError(`Failed to create musher: ${error.message}`);
    }
  }

  @Query(() => [Musher], { nullable: true })
  async getMushers(
    @Ctx() context: Context,
    @Arg("clubId", { nullable: true }) clubId?: string
  ): Promise<Musher[]> {
    try {
      // If clubId is provided, filter by it
      if (clubId) {
        console.log("Fetching mushers for club:", clubId);
        const mushers = await MusherModel.find({ club: clubId })
          .populate('club')
          .lean();
        console.log(`Found ${mushers.length} mushers for club ${clubId}`);
        
        // Log any mushers with invalid club references
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

      // If no clubId provided, return all mushers
      console.log("Fetching all mushers");
      const mushers = await MusherModel.find()
        .populate('club')
        .lean();
      console.log(`Found ${mushers.length} mushers in total`);
      
      // Log any mushers with invalid club references
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
    } catch (error) {
      console.error("Error fetching mushers:", error);
      throw new ApolloError(`Failed to fetch mushers: ${error.message}`);
    }
  }

  @Query(() => [Musher], { nullable: true })
  async getClubMushers(
    @Ctx() context: Context,
    @Arg("clubId", { nullable: true }) clubId?: string
  ): Promise<Musher[]> {
    try {
      // Use provided clubId or fall back to authenticated user's club
      const targetClubId = clubId || context.user?._id;
      
      if (!targetClubId) {
        throw new ApolloError("No club ID provided and user not authenticated");
      }

      console.log("Fetching mushers for club:", targetClubId);
      const mushers = await MusherModel.find({ club: targetClubId })
        .populate('club')
        .lean();
      console.log(`Found ${mushers.length} mushers for club ${targetClubId}`);
      
      // Log any mushers with invalid club references
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
    } catch (error) {
      console.error("Error fetching club mushers:", error);
      throw new ApolloError(`Failed to fetch club mushers: ${error.message}`);
    }
  }

  @Mutation(() => Musher)
  async updateMusher(
    @Arg("id", () => ID) id: string,
    @Arg("input", () => UpdateMusherInput) input: UpdateMusherInput,
    @Ctx() context: Context
  ): Promise<Musher> {
    if (!context.user?._id) {
      throw new ApolloError("User not authenticated");
    }

    try {
      // Log incoming data
      console.log("Updating musher. ID:", id);
      console.log("Update input:", JSON.stringify(input, null, 2));

      const existingMusher = await MusherModel.findById(id);
      if (!existingMusher) {
        throw new ApolloError("Musher not found");
      }

      // Process dogs if provided
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

      // Log update data
      console.log("Final update data:", JSON.stringify(updateData, null, 2));

      const updatedMusher = await MusherModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ) as Musher;

      if (!updatedMusher) {
        throw new ApolloError("Failed to update musher");
      }

      // Log updated data
      console.log("Updated musher:", JSON.stringify((updatedMusher as any).toObject(), null, 2));

      return updatedMusher;
    } catch (error) {
      console.error("Error updating musher:", error);
      throw new ApolloError(`Failed to update musher: ${error.message}`);
    }
  }

  @Mutation(() => Boolean)
  async deleteMusher(
    @Arg("id", () => ID) id: string,
    @Ctx() context: Context
  ): Promise<boolean> {
    if (!context.user?._id) {
      throw new ApolloError("User not authenticated");
    }

    try {
      console.log("Deleting musher with ID:", id);

      // First try to find the musher
      const existingMusher = await MusherModel.findOne({ _id: id });
      
      if (!existingMusher) {
        console.error("Musher not found with ID:", id);
        throw new ApolloError("Musher not found");
      }

      // Try to delete the musher
      const result = await MusherModel.findByIdAndDelete(id);
      
      if (!result) {
        console.error("Failed to delete musher with ID:", id);
        throw new ApolloError("Failed to delete musher");
      }

      console.log("Successfully deleted musher:", id);
      return true;
    } catch (error) {
      console.error("Error deleting musher:", error);
      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError(`Failed to delete musher: ${error.message}`);
    }
  }

  @Query(() => [Musher], { nullable: true })
  async checkDuplicateMusher(
    @Ctx() context: Context,
    @Arg("surname", { nullable: true }) surname?: string,
    @Arg("nzfssRegistrationNumber", { nullable: true }) nzfssRegistrationNumber?: string
  ): Promise<Musher[]> {
    try {
      const duplicates: Musher[] = [];
      
      // Check for duplicates by NZFSS registration number if provided
      if (nzfssRegistrationNumber && nzfssRegistrationNumber.trim()) {
        const mushersByRegistration = await MusherModel.find({
          registrationNo: { $regex: new RegExp(`^${nzfssRegistrationNumber.trim()}$`, 'i') }
        }).populate('club').lean();
        
        duplicates.push(...mushersByRegistration.map(musher => this.transformMusherDocument(musher)));
      }
      
      // Check for duplicates by surname if provided
      if (surname && surname.trim()) {
        const mushersBySurname = await MusherModel.find({
          name: { $regex: new RegExp(`\\b${surname.trim()}$`, 'i') }
        }).populate('club').lean();
        
        // Filter out any already added by registration number to avoid duplicates in result
        const newMushers = mushersBySurname.filter(musher => 
          !duplicates.some(existing => existing.id === musher._id.toString())
        );
        
        duplicates.push(...newMushers.map(musher => this.transformMusherDocument(musher)));
      }
      
      console.log(`Found ${duplicates.length} potential duplicate mushers for surname: ${surname}, registration: ${nzfssRegistrationNumber}`);
      
      return duplicates;
    } catch (error) {
      console.error("Error checking for duplicate mushers:", error);
      throw new ApolloError(`Failed to check for duplicate mushers: ${error.message}`);
    }
  }

  @Query(() => [Musher], { nullable: true })
  async getMushersForEvent(
    @Ctx() context: Context,
    @Arg("eventId") eventId: string
  ): Promise<Musher[]> {
    try {
      console.log(`Fetching mushers for event: ${eventId}`);
      
      // First get all entrants for this event to find which dogs are participating
      const { EntrantModel } = await import("../schema/entrants.schema");
      const entrants = await EntrantModel.find({ eventId: eventId })
        .populate('associatedDog')
        .lean();
      
      console.log(`Found ${entrants.length} entrants for event ${eventId}`);
      
      if (entrants.length === 0) {
        console.log(`No entrants found for event ${eventId}`);
        return [];
      }
      
      // Extract all unique NZFSS registration numbers from the event
      const eventDogRegistrations = new Set<string>();
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
      
      // Find mushers who have dogs participating in this event
      const mushers = await MusherModel.find({
        'dogs.nzfssNo': { $in: Array.from(eventDogRegistrations) }
      })
      .populate('club')
      .lean();
      
      console.log(`Found ${mushers.length} mushers with dogs participating in event ${eventId}`);
      
      // Filter out mushers with invalid club references
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
    } catch (error) {
      console.error("Error fetching mushers for event:", error);
      throw new ApolloError(`Failed to fetch mushers for event: ${error.message}`);
    }
  }
}