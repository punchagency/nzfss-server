import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import Context from "../types/context";
import { ApolloError } from "apollo-server";
import uploadFile from "../utils/s3Upload";
import _ from "lodash"
import { CalendarService } from "../service/calender.service";
import { CreateEventCalendarInput, EventCalendar, FindEventCalendarByIdInput, UpdateEventCalendarInput } from "../schema/calendar.schema";


@Resolver()
export default class CalendarResolver {
  constructor(private calendarService: CalendarService) {
    this.calendarService = new CalendarService();
  }

  @Authorized()
  @Mutation(() => EventCalendar)
  async createEvent(
    @Ctx() context: Context,
    @Arg("input") input: CreateEventCalendarInput
  ): Promise<EventCalendar> {
    try {
      const { photo, entryForm, fileName, website} = input;
      const user = context.user!;

      // Debug logging
      console.log("Resolver - Event type:", input.type);
      console.log("Resolver - NZFSSSanctioning input:", input.NZFSSSanctioning);
      
      // Force NZFSSSanctioning to false regardless of type
      input.NZFSSSanctioning = false;
      console.log("Resolver - NZFSSSanctioning after override:", input.NZFSSSanctioning);

      let uploadedFileUrl = null;
      let uploadPhoto = null;

      
      // If the file is provided, we assume the file is a base64-encoded string
      if(entryForm && fileName){
        uploadedFileUrl = await uploadFile(entryForm, user._id, "uploads/event/");
      } else if (!entryForm && !fileName && website) {
        uploadedFileUrl = website;
      }
      // uploadedFileUrl can remain null if neither file nor website is provided
      

      // Only upload photo if it's provided and not empty
      if(photo && photo.trim() !== '') {
        uploadPhoto = await uploadFile(photo, user._id, "uploads/photo/");
      }

      // Create eventData without requiring uploadedFileUrl or photo to be non-null
      const eventData = {
        ...input,
        entryForm: uploadedFileUrl, // Can be null
        photo: uploadPhoto // Can be null
      } as CreateEventCalendarInput;
      
      // Final check to ensure NZFSSSanctioning is false
      eventData.NZFSSSanctioning = false;
      console.log("Resolver - Final NZFSSSanctioning:", eventData.NZFSSSanctioning);

      return await this.calendarService.createCalendar(eventData);
    } catch (error) {
      console.error("Error in createEvent:", error);
      throw new ApolloError(`Error creating event: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  @Query(() => [EventCalendar], { nullable: true })
  async getAllEvents(@Ctx() context: Context) {
    // Allow unauthenticated access by making user optional
    const user = context.user;
    return await this.calendarService.getAllCalendarEvents(user);
  }

  @Query(() => [EventCalendar], { nullable: true })
  async getEventsWithResults(@Ctx() context: Context) {
    // Allow unauthenticated access by making user optional
    const user = context.user;
    return await this.calendarService.getEventsWithResults(user);
  }

  @Query(() => EventCalendar, { nullable: true })
  async findEventCalendarById(
    @Arg("input") input: FindEventCalendarByIdInput,
    @Ctx() context: Context
  ) {
    console.log(`Resolver: Finding event with ID: ${input._id}`);
    const user = context.user;
    const event = await this.calendarService.findEventCalendarById(input, user);
    
    if (event) {
      console.log(`Resolver: Returning event data for ${event.eventName}`);
      console.log(`Resolver: Event club: ${event.club}, type: ${event.type}, region: ${event.region}`);
    } else {
      console.log(`Resolver: No event found`);
    }

    return event;
  }

  @Authorized()
  @Mutation(() => EventCalendar)
  async updateEventCalendar(
    @Ctx() context: Context,
    @Arg("eventId") eventId: string,
    @Arg("input") input: UpdateEventCalendarInput,
  ): Promise<EventCalendar> {
    try {
      const { photo, entryForm, ...otherFields } = input;
      console.log("UPDATE EVENT - Raw photo input:", photo === null ? "NULL" : photo === undefined ? "UNDEFINED" : `string with length ${photo.length}`);
      console.log("UPDATE EVENT - Photo input prefix:", photo ? photo.substring(0, 50) : `no photo (${photo})`);

    const user = context.user!;

    let uploadedFileUrl = null;
    let uploadPhoto = null;

    if (entryForm) {
      // If the file is provided, we assume the file is a base64-encoded string
      console.log("UPDATE EVENT - Uploading entry form to S3...");
      uploadedFileUrl = await uploadFile(entryForm as string, user._id, "uploads/event/");
      console.log("UPDATE EVENT - Entry form uploaded to:", uploadedFileUrl);
      if (!uploadedFileUrl) {
        throw new ApolloError("Error uploading the file.");
      }
    }

    // Handle photo upload/deletion with proper validation
    if (photo && typeof photo === 'string' && photo.trim() !== '' && photo !== 'null') {
      console.log("UPDATE EVENT - Uploading photo to S3...");
      uploadPhoto = await uploadFile(photo, user._id, "uploads/photo/");
      console.log("UPDATE EVENT - Photo uploaded to:", uploadPhoto);
    } else if (photo === null || photo === 'null' || photo === '') {
      console.log("UPDATE EVENT - Photo deletion requested (null/empty value)");
      uploadPhoto = null;
    } else {
      console.log("UPDATE EVENT - No photo processing needed");
    }

    // Build formData with other fields first
    const formData: UpdateEventCalendarInput = { ...otherFields };

    // Then conditionally add uploaded URLs (this prevents overwriting S3 URLs with base64 data)
    if (uploadedFileUrl) {
      formData.entryForm = uploadedFileUrl;
    }

    // Handle photo: include it if it was uploaded OR if it was explicitly set to null for deletion
    if (uploadPhoto) {
      formData.photo = uploadPhoto;
    } else if (photo === null || photo === 'null' || photo === '') {
      console.log("UPDATE EVENT - Including photo deletion in formData");
      formData.photo = null;
    }
    // If photo is undefined, don't include it in formData at all (preserve existing value)

    console.log("UPDATE EVENT - Final formData photo:", formData.photo);
    console.log("UPDATE EVENT - formData has photo field:", 'photo' in formData);
    console.log("UPDATE EVENT - Complete formData keys:", Object.keys(formData));

      return await this.calendarService.updateEventCalendar(formData, user, eventId);
    } catch (error) {
      console.error("UPDATE EVENT - Error:", error);
      throw new ApolloError("Internal server error: " + error);
    }
  }

  @Authorized()
  @Mutation(() => EventCalendar)
  async deleteEvent(@Ctx() context: Context, @Arg("eventId") eventId: string) {
    const user = context.user;
    if (!user) {
      throw new ApolloError("Unauthorized: User is not authenticated");
    }

    return await this.calendarService.deleteEvent(user, eventId);
  }
}
