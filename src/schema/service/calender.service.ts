import { ApolloError } from "apollo-server";
import { isAdmin } from "../../utils/helpers";
import { logger } from "../../utils/logger";
import { User } from "../user.schema";
import { CreateFormInput, FindFormByIdInput, Form, FormModel, UpdateFormInput } from "../form.schema";
import { CreateEventCalendarInput, EventCalendar, EventCalendarModel, FindEventCalendarByIdInput, UpdateEventCalendarInput } from "../calendar.schema";

export class CalendarService {

  async createCalendar(input: CreateEventCalendarInput):Promise<EventCalendar>{
    try {

       // Create a new Event entry
       const newEvent = await EventCalendarModel.create(input);

      return newEvent;

    } catch (error) {
      // Catch any error that occurs in the try block and handle it
      if (error instanceof ApolloError) {
        // If the error is already an ApolloError, just throw it
        throw error;
      }

      // If the error is something else (e.g. validation or database error), log and rethrow
      logger.error("Error creating event:", error);
      throw new ApolloError(
        "An unexpected error occurred while creating the event"
      );
    }
  }

  async getAllCalendarEvents(user: User) {
    // Check if the user's role is 'admin'
    const isAdmin = user.role === "ADMIN";

    try {
      let events;

      if (isAdmin) {
        // If the user is an admin, return all events
        events = await EventCalendarModel.find().lean();
      } else if (user.role === "CLUB") {
        // If the user is a club, return only their events (matching clubId)
        events = await EventCalendarModel.find({ clubId: user._id }).lean();
      } else {
        // For other roles, throw an unauthorized error
        throw new Error("Unauthorized: Only admin or club can access this resource");
      }
  
      return events;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async findEventCalendarById(input: FindEventCalendarByIdInput, user: User) {
    const error = " Event with the given Id does not exist";
    const isAdmin = user.role === "ADMIN";
    try {
      if (!user || !isAdmin) {
        throw new ApolloError(
          "Unauthorized: Only admin can access this resource"
        );
      }

      const event = await EventCalendarModel.findById(input._id).lean();
      if (!event) {
        throw new ApolloError(error);
      }
      return event;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Internal sever error ");
    }
  }

  async updateEventCalendar(input: UpdateEventCalendarInput, user: User, eventId: String) {
       const isAdmin = user.role === "ADMIN";

       const existingEvent = await EventCalendarModel.findById(eventId)

      if(!existingEvent){
        throw new ApolloError("Event does not exit");
      }

      if (!user || (!isAdmin && user._id !== existingEvent.clubId)) {
        throw new ApolloError("Unauthorized: Only admin can Update this club");
      }

    try {
     
      // Find and update the yearbook
      const event = await EventCalendarModel.findOneAndUpdate(
        { _id: eventId },
        { $set: input },
        { new: true }
      );

      if (!event) {
        throw new ApolloError("Event not found or update failed");
      }

      return event;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error ");
    }
  }

  async deleteEvent(user: User, eventId: String) {
    try {
      const isAdmin = user.role === "ADMIN";

      const existingEvent = await EventCalendarModel.findById(eventId)

      if(!existingEvent){
        throw new ApolloError("Event does not exit");
      }

      if (!user || (!isAdmin && user._id !== existingEvent.clubId)) {
        throw new ApolloError("Unauthorized: Only admin can delete this club");
      }

      const deletedEvent = await EventCalendarModel.findByIdAndDelete(eventId).lean();

      return deletedEvent;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }
}
