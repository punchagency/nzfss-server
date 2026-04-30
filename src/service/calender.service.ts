import { ApolloError } from "apollo-server";
import { isAdmin } from "../utils/helpers";
import { logger } from "../utils/logger";
import { User } from "../schema/user.schema";
import { CreateFormInput, FindFormByIdInput, Form, FormModel, UpdateFormInput } from "../schema/form.schema";
import { CreateEventCalendarInput, EventCalendar, EventCalendarModel, FindEventCalendarByIdInput, UpdateEventCalendarInput } from "../schema/calendar.schema";
import { NotificationService } from "./notification.service";
import UserService from "../service/user.service";
import { EntrantService } from "./entrant.service";
import { LogService } from "./log.service";

export class CalendarService {
  private notificationService: NotificationService;
  private userService: UserService;
  private entrantService: EntrantService;

  constructor() {
    this.notificationService = new NotificationService();
    this.userService = new UserService();
    this.entrantService = new EntrantService(new LogService());
  }

  async createCalendar(input: CreateEventCalendarInput): Promise<EventCalendar> {
    try {
      console.log("Event type:", input.type);
      console.log("Input NZFSSSanctioning before save:", input.NZFSSSanctioning);
      const event = await EventCalendarModel.create(input);
      console.log("Event NZFSSSanctioning after save:", event.NZFSSSanctioning);
      return event;
    } catch (error) {
      logger.error("Error in createCalendar:", error);
      throw new ApolloError(`Error creating calendar event: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async getAllCalendarEvents(user?: User) {
    try {
      let events;
      
      if (user?.role === "ADMIN") {
        // If the user is an admin, return all events
        events = await EventCalendarModel.find().sort({ eventDate: -1 }).lean();
      } else {
        // First, get all entrant IDs that have points
        const { PointModel } = await import('../schema/point.schema');
        const pointsWithEntrants = await PointModel.find({}).select('entrantId').lean();
        const entrantIdsWithPoints = pointsWithEntrants.map(p => p.entrantId);
        
        // Then find all events that have these entrants
        const { EntrantModel } = await import('../schema/entrants.schema');
        const entrantsWithPoints = await EntrantModel.find({
          _id: { $in: entrantIdsWithPoints }
        }).select('eventId').lean();
        const eventIdsWithPoints = entrantsWithPoints.map(e => e.eventId);
        
        if (user?.role === "CLUB") {
          // For club users, return:
          // 1. Their own events (regardless of public status)
          // 2. Public events from other clubs
          // 3. Events that have results (regardless of public status)
          events = await EventCalendarModel.find({
            $or: [
              { clubId: user._id }, // User's own events
              { public: true },      // Public events from other clubs
              { _id: { $in: eventIdsWithPoints } } // Events that have points
            ]
          }).sort({ eventDate: -1 }).lean();
        } else {
          // For unauthenticated users, return:
          // 1. Public events
          // 2. Events that have results (regardless of public status)
          events = await EventCalendarModel.find({
            $or: [
              { public: true },      // Public events
              { _id: { $in: eventIdsWithPoints } } // Events that have points
            ]
          }).sort({ eventDate: -1 }).lean();
        }
      }

      // Log the number of events fetched and user details
      logger.info(`Fetched ${events.length} events for user`, {
        userId: user?._id,
        role: user?.role,
        clubId: user?.role === "CLUB" ? user._id : null
      });

      return events;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async getEventsWithResults(user?: User) {
    try {
      // First, get all entrant IDs that have points
      const { PointModel } = await import('../schema/point.schema');
      const pointsWithEntrants = await PointModel.find({}).select('entrantId').lean();
      const entrantIdsWithPoints = pointsWithEntrants.map(p => p.entrantId);
      
      if (entrantIdsWithPoints.length === 0) {
        // No events have results yet
        return [];
      }
      
      // Then find all events that have these entrants
      const { EntrantModel } = await import('../schema/entrants.schema');
      const entrantsWithPoints = await EntrantModel.find({
        _id: { $in: entrantIdsWithPoints }
      }).select('eventId').lean();
      const eventIdsWithPoints = entrantsWithPoints.map(e => e.eventId);
      
      if (eventIdsWithPoints.length === 0) {
        // No events have results yet
        return [];
      }
      
      // Find events that have results and are submitted and public
      let events;
      if (user?.role === "ADMIN") {
        // Admins can see all events with results
        events = await EventCalendarModel.find({
          _id: { $in: eventIdsWithPoints },
          isSubmitted: true
        }).sort({ eventDate: -1 }).lean();
      } else if (user?.role === "CLUB") {
        // Club users can see:
        // 1. Their own events with results (regardless of public status)
        // 2. Public events with results from other clubs
        events = await EventCalendarModel.find({
          _id: { $in: eventIdsWithPoints },
          isSubmitted: true,
          $or: [
            { clubId: user._id }, // User's own events
            { public: true }       // Public events from other clubs
          ]
        }).sort({ eventDate: -1 }).lean();
      } else {
        // Unauthenticated users can only see public events with results
        events = await EventCalendarModel.find({
          _id: { $in: eventIdsWithPoints },
          isSubmitted: true,
          public: true
        }).sort({ eventDate: -1 }).lean();
      }

      // Log the number of events with results fetched
      logger.info(`Fetched ${events.length} events with results for user`, {
        userId: user?._id,
        role: user?.role,
        clubId: user?.role === "CLUB" ? user._id : null
      });

      return events;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async findEventCalendarById(input: FindEventCalendarByIdInput, user?: User) {
    const error = "Event with the given Id does not exist";
    
    try {
      // Make event accessible to everyone, regardless of authentication
      console.log(`Finding event with ID: ${input._id}`);
      const event = await EventCalendarModel.findById(input._id).lean();
      
      if (!event) {
        console.log(`No event found with ID: ${input._id}`);
        throw new ApolloError(error);
      }
      
      // Fix for non-nullable fields with null values
      const sanitizedEvent = {
        ...event,
        // Ensure preferredDate is never null
        preferredDate: event.preferredDate || "Unknown date",
        // Ensure other required fields are never null
        alternativeDate: event.alternativeDate || "Unknown date",
        eventName: event.eventName || "Unnamed event",
        club: event.club || "Unknown club",
        region: event.region || "Unknown region",
        type: event.type || "Unknown type",
      };
      
      console.log(`Event found: ${JSON.stringify({
        _id: sanitizedEvent._id,
        eventName: sanitizedEvent.eventName,
        club: sanitizedEvent.club,
        type: sanitizedEvent.type,
        region: sanitizedEvent.region,
        eventDate: sanitizedEvent.eventDate
      })}`);
      
      return sanitizedEvent;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Internal server error");
    }
  }

  async updateEventCalendar(input: UpdateEventCalendarInput, user: User, eventId: string) {
    const isAdmin = user.role === "ADMIN";

    try {
      console.log("SERVICE - Updating event:", eventId);
      console.log("SERVICE - Input photo field:", input.photo === null ? "NULL" : input.photo === undefined ? "UNDEFINED" : `string with length ${input.photo?.length}`);
      console.log("SERVICE - Input has photo field:", 'photo' in input);
      console.log("SERVICE - Complete input:", Object.keys(input));

      const existingEvent = await EventCalendarModel.findById(eventId);

      if (!existingEvent) {
        throw new ApolloError("Event does not exist");
      }

      if (!user || (!isAdmin && user._id !== existingEvent.clubId)) {
        throw new ApolloError("Unauthorized: Only admin can Update this club");
      }

      console.log("SERVICE - Existing event photo:", existingEvent.photo);
      console.log("SERVICE - About to update with $set:", input);

      // Find and update the event
      const event = await EventCalendarModel.findOneAndUpdate(
        { _id: eventId },
        { $set: input },
        { new: true }
      );

      console.log("SERVICE - Updated event photo:", event?.photo);

      if (!event) {
        throw new ApolloError("Event not found or update failed");
      }

      // Create notification for admin when event is submitted
      if (input.isSubmitted === true && !existingEvent.isSubmitted) {
        console.log("Creating notification for admin - Event submission");
        console.log("Input isSubmitted:", input.isSubmitted);
        console.log("Existing event isSubmitted:", existingEvent.isSubmitted);
        
        const admins = await this.userService.getAdminUsers();
        console.log("Found admin users:", admins.map(admin => ({
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        })));
        
        for (const admin of admins) {
          console.log("Creating notification for admin:", {
            adminId: admin._id,
            adminName: admin.name,
            adminEmail: admin.email
          });
          const notification = await this.notificationService.createNotification({
            title: "New Event Submission",
            message: `Club "${event.club}" has submitted event "${event.eventName}" for approval`,
            type: "EVENT_SUBMISSION",
            userId: admin._id,
            eventId: event._id,
          });
          console.log("Notification created:", notification);
        }
      }

      // Create notification for club when event is approved/declined
      if (input.status && input.status !== existingEvent.status) {
        const approvedDate = event.eventDate ? new Date(event.eventDate).toLocaleDateString() : undefined;
        const statusMessage = input.status === "Approve"
          ? `The date for your event "${event.eventName}" has been approved.${approvedDate ? ` Approved date: ${approvedDate}.` : ''}`
          : "";
        
        if (statusMessage) {
          await this.notificationService.createNotification({
            title: `Event ${input.status === "Approve" ? "Approved" : input.status}`,
            message: statusMessage,
            type: "EVENT_STATUS_UPDATE",
            userId: event.clubId,
            eventId: event._id,
          });
        }
      }

      return event;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async deleteEvent(user: User, eventId: string) {
    try {
      const isAdmin = user.role === "ADMIN";

      const existingEvent = await EventCalendarModel.findById(eventId);

      if (!existingEvent) {
        throw new ApolloError("Event does not exist");
      }

      if (!user || (!isAdmin && user._id !== existingEvent.clubId)) {
        throw new ApolloError("Unauthorized: Only admin can delete this club");
      }

      // Delete all associated entrants for this event
      await this.entrantService.deleteEntrantsByEventId(eventId);

      const deletedEvent = await EventCalendarModel.findByIdAndDelete(eventId).lean();

      return deletedEvent;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }
}
