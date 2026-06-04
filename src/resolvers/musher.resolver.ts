import { Resolver, Query, Mutation, Arg, Ctx, Authorized, ID } from "type-graphql";
import { Context } from "../types/context";
import { ApolloError } from "apollo-server";
import { MusherModel } from "../models/musher.model";
import { Musher, CreateMusherInput, UpdateMusherInput } from "../schema/musher.schema";
import { getModelForClass } from "@typegoose/typegoose";
import { ClubModel } from "../schema/club.schema";
import {
  processDogsForCreate,
  processDogsForUpdate,
} from "../utils/process-musher-dogs";
import { isValidDogId } from "../utils/dog-id";
import { ensureDogIdsForSave } from "./dog.resolver";

@Resolver()
export default class MusherResolver {
  /** Re-save dogs when dogId did not persist (e.g. server started before schema update). */
  private async persistDogIdsIfMissing(
    musherId: string,
    doc: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const dogs = (doc.dogs as Array<{ dogId?: string }>) || [];
    const needsFix = dogs.some((d) => !isValidDogId(d.dogId));
    if (!needsFix) return doc;

    const fixed = ensureDogIdsForSave(
      dogs.map((d) => ({
        name: (d as { name?: string }).name || "",
        pedigreeName: (d as { pedigreeName?: string }).pedigreeName || "",
        nzkcNo: (d as { nzkcNo?: string }).nzkcNo || "",
        nzfssNo: (d as { nzfssNo?: string }).nzfssNo || "",
        dateOfBirth:
          (d as { dateOfBirth?: string }).dateOfBirth ||
          (d as { dob?: string }).dob ||
          "",
        breed: (d as { breed?: string }).breed || "",
        deceased: Boolean((d as { deceased?: boolean }).deceased),
        dogId: d.dogId,
      }))
    );

    await MusherModel.findByIdAndUpdate(musherId, { $set: { dogs: fixed } });
    return { ...doc, dogs: fixed };
  }

  private mapDogToGraphQL(dog: {
    dogId?: string;
    name?: string;
    pedigreeName?: string;
    nzkcNo?: string;
    nzfssNo?: string;
    dateOfBirth?: string;
    dob?: string;
    breed?: string;
    deceased?: boolean;
  }) {
    const dogId = dog.dogId && isValidDogId(dog.dogId) ? dog.dogId : "";
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
    };
  }

  private transformMusherDocument(doc: any): Musher {
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
      dogs: storedDogs.map((dog: Record<string, unknown>) => this.mapDogToGraphQL(dog)),
      showProfileConsent: doc.showProfileConsent,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
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
      if (!input.clubId) {
        throw new ApolloError("Club ID is required");
      }

      const club = await ClubModel.findById(input.clubId);
      if (!club) {
        throw new ApolloError("Invalid club ID: Club not found");
      }

      const processedDogs = ensureDogIdsForSave(processDogsForCreate(input.dogs));

      const musher = await MusherModel.create({
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

      const doc = await this.persistDogIdsIfMissing(
        (musher as { _id: { toString(): string } })._id.toString(),
        (musher as { toObject(): Record<string, unknown> }).toObject()
      );
      return this.transformMusherDocument(doc);
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
      if (clubId) {
        const mushers = await MusherModel.find({ club: clubId })
          .populate('club')
          .lean();
        
        const validMushers = mushers.filter(musher => musher.club);
        return validMushers.map(musher => this.transformMusherDocument(musher));
      }

      const mushers = await MusherModel.find()
        .populate('club')
        .lean();
      
      const validMushers = mushers.filter(musher => musher.club);
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
      const targetClubId = clubId || context.user?._id;
      
      if (!targetClubId) {
        throw new ApolloError("No club ID provided and user not authenticated");
      }

      const mushers = await MusherModel.find({ club: targetClubId })
        .populate('club')
        .lean();
      
      const validMushers = mushers.filter(musher => musher.club);
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
      const existingMusher = await MusherModel.findById(id).lean();
      if (!existingMusher) {
        throw new ApolloError("Musher not found");
      }

      let processedDogs;
      if (input.dogs) {
        processedDogs = ensureDogIdsForSave(
          processDogsForUpdate(input.dogs, existingMusher.dogs || [])
        );
      }

      const { clubId, dogs: _dogs, ...restInput } = input;
      const updateData: Record<string, unknown> = {
        ...restInput,
        ...(processedDogs && { dogs: processedDogs }),
        ...(clubId && { club: clubId }),
        updatedAt: new Date()
      };

      const updatedMusher = await MusherModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).populate('club').lean();

      if (!updatedMusher) {
        throw new ApolloError("Failed to update musher");
      }

      const doc = await this.persistDogIdsIfMissing(
        id,
        updatedMusher as Record<string, unknown>
      );
      return this.transformMusherDocument(doc);
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
      const existingMusher = await MusherModel.findOne({ _id: id });
      
      if (!existingMusher) {
        throw new ApolloError("Musher not found");
      }

      const result = await MusherModel.findByIdAndDelete(id);
      
      if (!result) {
        throw new ApolloError("Failed to delete musher");
      }

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
      
      if (nzfssRegistrationNumber && nzfssRegistrationNumber.trim()) {
        const mushersByRegistration = await MusherModel.find({
          registrationNo: { $regex: new RegExp(`^${nzfssRegistrationNumber.trim()}$`, 'i') }
        }).populate('club').lean();
        
        duplicates.push(...mushersByRegistration.map(musher => this.transformMusherDocument(musher)));
      }
      
      if (surname && surname.trim()) {
        const mushersBySurname = await MusherModel.find({
          name: { $regex: new RegExp(`\\b${surname.trim()}$`, 'i') }
        }).populate('club').lean();
        
        const newMushers = mushersBySurname.filter(musher => 
          !duplicates.some(existing => existing.id === musher._id.toString())
        );
        
        duplicates.push(...newMushers.map(musher => this.transformMusherDocument(musher)));
      }
      
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
      const { EntrantModel } = await import("../schema/entrants.schema");
      const entrants = await EntrantModel.find({ eventId: eventId })
        .populate('associatedDog')
        .lean();
      
      if (entrants.length === 0) {
        return [];
      }
      
      const eventDogRegistrations = new Set<string>();
      const eventDogIds = new Set<string>();
      entrants.forEach(entrant => {
        if (entrant.associatedDog && Array.isArray(entrant.associatedDog)) {
          entrant.associatedDog.forEach(dog => {
            if (dog.NZFSSRegistration && dog.NZFSSRegistration.trim() !== '') {
              eventDogRegistrations.add(dog.NZFSSRegistration);
            }
            if (dog.dogId && isValidDogId(dog.dogId)) {
              eventDogIds.add(dog.dogId);
            }
          });
        }
      });
      
      if (eventDogRegistrations.size === 0 && eventDogIds.size === 0) {
        return [];
      }
      
      const queryConditions: Record<string, unknown>[] = [];
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

      const mushers = await MusherModel.find({
        $or: queryConditions
      })
      .populate('club')
      .lean();
      
      const validMushers = mushers.filter(musher => musher.club);
      return validMushers.map(musher => this.transformMusherDocument(musher));
    } catch (error) {
      console.error("Error fetching mushers for event:", error);
      throw new ApolloError(`Failed to fetch mushers for event: ${error.message}`);
    }
  }
}
