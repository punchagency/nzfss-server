import { ApolloError } from "apollo-server";
import { isAdmin } from "../utils/helpers";
import { logger } from "../utils/logger";
import { User } from "../schema/user.schema";
import { CreateFormInput, FindFormByIdInput, Form, FormModel, UpdateFormInput } from "../schema/form.schema";
import uploadFile from "../utils/s3Upload";
import { Musher } from "../schema/musher.schema";
import { getModelForClass } from "@typegoose/typegoose";
import { NotificationService } from "./notification.service";
import { Club, ClubModel } from "../schema/club.schema";
import { EmailService } from "./email.service";
import {
  processDogsForCreate,
  processDogsForUpdate,
  ensureDogIdsOnStoredDogs,
} from "../utils/process-musher-dogs";
import { buildDogLookup, findExistingDog } from "../utils/dog-id";

function mapFormDogToMusherInput(dog: {
  petName?: string;
  pedigreeName?: string;
  nzkcRegistration?: string;
  nzfssNumber?: string;
  dateOfBirth?: string;
  breed?: string;
  isDeceased?: boolean;
}) {
  return {
    name: dog.petName,
    pedigreeName: dog.pedigreeName || "",
    nzkcNo: dog.nzkcRegistration || "",
    nzfssNo: dog.nzfssNumber || "",
    dateOfBirth: dog.dateOfBirth || "",
    breed: dog.breed || "",
    deceased: dog.isDeceased || false,
  };
}

function mapMusherDogsToFormDogs(
  dogs: Array<{
    name?: string;
    nzfssNo?: string;
    pedigreeName?: string;
    breed?: string;
    dateOfBirth?: string;
    deceased?: boolean;
    nzkcNo?: string;
  }> = []
) {
  return dogs.map((dog) => ({
    petName: dog.name || "",
    nzfssNumber: dog.nzfssNo || "",
    pedigreeName: dog.pedigreeName || "",
    breed: dog.breed || "",
    dateOfBirth: dog.dateOfBirth || "",
    isDeceased: dog.deceased || false,
    nzkcRegistration: dog.nzkcNo || "",
  }));
}

function bothClubsApproved(form: Pick<Form, "fromClubApproval" | "toClubApproval">): boolean {
  return form.fromClubApproval === "approved" && form.toClubApproval === "approved";
}

function userClubId(user: User): string {
  return user._id.toString();
}

function userCanActOnChangeForm(form: Pick<Form, "affiliationFrom" | "affiliationTo">, user: User): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role !== "CLUB") return false;
  const clubId = userClubId(user);
  return form.affiliationFrom === clubId || form.affiliationTo === clubId;
}

function approvalSideForUser(form: Pick<Form, "affiliationFrom" | "affiliationTo">, user: User): "from" | "to" | "admin" | null {
  if (user.role === "ADMIN") return "admin";
  const clubId = userClubId(user);
  if (form.affiliationFrom === clubId) return "from";
  if (form.affiliationTo === clubId) return "to";
  return null;
}

export class FormService {
  private notificationService: NotificationService;
  private emailService: EmailService;

  constructor() {
    this.notificationService = new NotificationService();
    this.emailService = new EmailService();
  }

  async createForm(input: CreateFormInput, user: User):Promise<Form>{
    const adminErr = "Only admin can add a Form";
    
    try {
      // Allow regular users to submit musher registration forms
      const isMusherRegistration = input.formType === "new" || input.formType === "renewal" || input.formType === "change";
      
      // Only require admin for non-musher registration forms
      if (!isMusherRegistration) {
        const adminUser = user!;
        if (!adminUser || !isAdmin(adminUser.role)) {
          throw new ApolloError(adminErr);
        }
      }

      // Upload file to S3 if provided
      let fileUrl: string | undefined = undefined;
      if (input.file) {
        try {
          // Log details about the file
          logger.info(`FormService: Processing file upload. Length: ${input.file.length}`);
          logger.info(`FormService: File prefix: "${input.file.substring(0, 50)}"`);
          
          // Validate the file is a base64 string
          if (!input.file.startsWith("data:")) {
            // Check for malformed prefix
            if (input.file.includes("data:")) {
              const dataIndex = input.file.indexOf("data:");
              logger.info(`FormService: Found 'data:' at position ${dataIndex}, extracting valid part`);
              input.file = input.file.substring(dataIndex);
            } else if (input.file.startsWith("http")) {
              // This is already a URL, not a base64 string - just use it directly
              logger.info(`FormService: File appears to be a URL, not base64. Using directly: ${input.file.substring(0, 50)}`);
              fileUrl = input.file;
              // Skip the upload since this is already a URL
              const newForm = await FormModel.create({
                formName: input.formName, 
                formType: input.formType,
                file: fileUrl,
                fileName: input.fileName
              });
              return newForm;
            } else if (/^[A-Za-z0-9+/=]+$/.test(input.file.substring(0, 20))) {
              // Looks like raw base64 without prefix
              logger.info("FormService: Raw base64 detected, adding PDF prefix");
              input.file = `data:application/pdf;base64,${input.file}`;
            } else {
              throw new ApolloError("Invalid file format: File must be properly base64 encoded with data URI prefix");
            }
          }
          
          // Now do the upload with the validated/fixed file data
          const uploadedUrl = await uploadFile(
            input.file,
            `${user._id}-${Date.now()}`,
            "forms/"
          );
          
          if (!uploadedUrl) {
            throw new ApolloError("Failed to upload file to S3");
          }
          
          fileUrl = uploadedUrl;
          logger.info(`FormService: File uploaded successfully. URL: ${fileUrl}`);
        } catch (error) {
          logger.error(`FormService: Upload error: ${error instanceof Error ? error.message : "Unknown error"}`);
          throw new ApolloError(`File upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }

      // Create a new form entry
      try {
        logger.info(`FormService: Creating form entry in database: ${input.formName}`);
        logger.info(`FormService: Form input data:`, {
          formType: input.formType,
          applicantName: input.applicantName,
          firstName: input.firstName,
          surname: input.surname,
          email: input.email,
          phone: input.phone,
          address: input.address,
          club: input.club,
          dogsCount: input.dogs?.length || 0
        });
        const isChangeForm = input.formType === "change";
        const newForm = await FormModel.create({
          formName: input.formName, 
          formType: input.formType,
          file: fileUrl,
          fileName: input.fileName,
          // Add musher registration specific fields
          applicantName: input.applicantName,
          surname: input.surname,
          firstName: input.firstName,
          address: input.address,
          dateOfBirth: input.dateOfBirth,
          phone: input.phone,
          email: input.email,
          guardianDetails: input.guardianDetails,
          nzfssRegistrationNumber: input.nzfssRegistrationNumber,
          club: isChangeForm ? (input.affiliationTo || input.club) : input.club,
          affiliationFrom: input.affiliationFrom,
          affiliationTo: input.affiliationTo,
          musherId: input.musherId,
          fromClubApproval: isChangeForm ? (input.fromClubApproval || "pending") : undefined,
          toClubApproval: isChangeForm ? (input.toClubApproval || "pending") : undefined,
          dogs: input.dogs,
          showProfileConsent: input.showProfileConsent,
          status: input.status || "pending"
        });
        
        // If this is a new musher registration form, send email notification to the club
        if (input.formType === "new" && input.club) {
          try {
            // Prefer the current user email for the club account; fallback to Club document
            let clubEmail: string | undefined;
            const clubUser = await (await import('../schema/user.schema')).UserModel.findById(input.club).lean();
            if (clubUser?.email) clubEmail = clubUser.email;
            if (!clubEmail) {
              const club = await ClubModel.findById(input.club).lean();
              if (club?.email) clubEmail = club.email;
            }

            if (clubEmail) {
              try {
                await this.emailService.sendFormNotification(clubEmail, {
                  applicantName: `${input.firstName} ${input.surname}`,
                  formType: input.formType,
                  email: input.email || '',
                  phone: input.phone || '',
                });
                logger.info(`Form notification email sent successfully to club ${clubEmail}`);
              } catch (emailError) {
                // Log the error but don't fail the form creation
                logger.error('Failed to send form notification email:', emailError);
                // You might want to create a notification for the admin about the email failure
                await this.notificationService.createNotification({
                  title: "Email Notification Failed",
                  message: `Failed to send email notification for new musher registration to ${clubEmail ?? 'unknown email'}`,
                  type: "SYSTEM_ERROR",
                  userId: input.club,
                  eventId: newForm._id.toString()
                });
              }
            } else {
              logger.warn(`Club ${input.club} has no email address configured`);
            }
          } catch (error) {
            logger.error('Error processing club email notification:', error);
          }
        }
        
        logger.info(`FormService: Form created successfully with ID: ${newForm._id}`);

        // Create notification for club if this is a musher registration
        if (isMusherRegistration) {
          try {
            if (isChangeForm) {
              const musherLabel =
                input.applicantName || `${input.firstName || ""} ${input.surname || ""}`.trim();
              const dogCount = input.dogs?.length || 0;
              const notifyIds = new Set<string>();
              if (input.affiliationFrom) notifyIds.add(input.affiliationFrom);
              if (input.affiliationTo) notifyIds.add(input.affiliationTo);
              for (const clubUserId of notifyIds) {
                const isDestination = clubUserId === input.affiliationTo;
                await this.notificationService.createNotification({
                  title: isDestination ? "Incoming Musher Transfer" : "Musher Transfer Request",
                  message: isDestination
                    ? `${musherLabel} has requested to transfer to your club (${dogCount} dog${dogCount === 1 ? "" : "s"}). Your approval is required.`
                    : `${musherLabel} has submitted a change of registration. Your release approval is required.`,
                  type: "MUSHER_TRANSFER",
                  userId: clubUserId,
                  eventId: newForm._id.toString(),
                });
              }
              logger.info(`FormService: Created transfer notifications for change form ${newForm._id}`);
            } else if (input.club) {
              await this.notificationService.createNotification({
                title: "New Musher Registration",
                message: `New ${input.formType} form submitted by ${input.applicantName || `${input.firstName} ${input.surname}`}`,
                type: "MUSHER_SUBMISSION",
                userId: input.club,
                eventId: newForm._id.toString(),
              });
              logger.info(`FormService: Created notification for club ${input.club}`);
            }
          } catch (notifError) {
            logger.error(`FormService: Failed to create notification: ${notifError instanceof Error ? notifError.message : "Unknown error"}`);
          }
        }

        return newForm;
      } catch (dbError) {
        logger.error(`FormService: Database error: ${dbError instanceof Error ? dbError.message : "Unknown error"}`);
        throw new ApolloError(`Database error creating form: ${dbError instanceof Error ? dbError.message : "Unknown error"}`);
      }

    } catch (error) {
      // Catch any error that occurs in the try block and handle it
      if (error instanceof ApolloError) {
        // If the error is already an ApolloError, just throw it
        throw error;
      }

      // If the error is something else (e.g. validation or database error), log and rethrow
      logger.error(`FormService error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new ApolloError(
        "An unexpected error occurred while creating the form"
      );
    }
  }

  async getAllForms(user: User | null) {
    try {
      // Allow access to guests (unauthenticated users)
      if (user && user.role !== "ADMIN" && user.role !== "CLUB") {
        throw new ApolloError("Unauthorized: Only admin or club users can access this resource");
      }

      // Fetch forms for all users, including guests
      // Exclude musher registration forms from public forms page
      const forms = await FormModel.find({
        formType: { $nin: ["new", "renewal", "change"] }
      }).lean();
      
      // Ensure all required fields are present
      // Only return forms that have files (downloadable forms)
      const validForms = forms.filter(form => 
        form.formName && 
        form.formType && 
        form.file
      );

      return validForms;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async getForms(user: User | null, formType?: string, status?: string, clubId?: string) {
    try {
      if (!user || (user.role !== "ADMIN" && user.role !== "CLUB")) {
        throw new ApolloError("Unauthorized: Only admin or club users can access this resource");
      }

      const query: Record<string, unknown> = {};
      if (status) {
        query.status = status;
      }

      if (formType === "change") {
        query.formType = "change";
        if (clubId) {
          query.$or = [{ affiliationFrom: clubId }, { affiliationTo: clubId }];
        }
      } else if (formType) {
        query.formType = formType;
        if (clubId) {
          query.club = clubId;
        }
      } else if (clubId) {
        // Default pending-forms view: new + renewal only for this club
        query.club = clubId;
        query.formType = { $in: ["new", "renewal"] };
      }

      const forms = await FormModel.find(query).lean();
      return forms;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Error retrieving forms");
    }
  }

  async requestMusherTransfer(
    musherId: string,
    destinationClubId: string,
    user: User
  ): Promise<Form> {
    if (user.role !== "ADMIN" && user.role !== "CLUB") {
      throw new ApolloError("Unauthorized: Only club admins can request transfers");
    }

    const MusherModel = getModelForClass(Musher);
    const musher = await MusherModel.findById(musherId);
    if (!musher) {
      throw new ApolloError("Musher not found");
    }

    const sourceClubId = musher.club?.toString();
    if (user.role === "CLUB" && sourceClubId !== userClubId(user)) {
      throw new ApolloError("Unauthorized: You can only transfer mushers from your own club");
    }

    if (!destinationClubId) {
      throw new ApolloError("Destination club is required");
    }

    if (destinationClubId === sourceClubId) {
      throw new ApolloError("Cannot transfer a musher to the same club");
    }

    const existingPending = await FormModel.findOne({
      formType: "change",
      status: "pending",
      musherId,
    });
    if (existingPending) {
      throw new ApolloError("A transfer is already pending for this musher");
    }

    const nameParts = (musher.name || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const surname = nameParts.slice(1).join(" ");

    const newForm = await FormModel.create({
      formType: "change",
      formName: "Club Musher Transfer Request",
      applicantName: musher.name,
      firstName,
      surname,
      address: musher.address || "",
      phone: musher.phone || "",
      email: musher.email || "",
      dateOfBirth: musher.dateOfBirth || "",
      guardianDetails: musher.guardianDetails || "",
      nzfssRegistrationNumber: musher.registrationNo || "",
      musherId: musher._id.toString(),
      affiliationFrom: sourceClubId,
      affiliationTo: destinationClubId,
      club: destinationClubId,
      fromClubApproval: "approved",
      toClubApproval: "pending",
      dogs: mapMusherDogsToFormDogs(musher.dogs || []),
      showProfileConsent: musher.showProfileConsent,
      status: "pending",
    });

    const dogCount = musher.dogs?.length || 0;
    try {
      await this.notificationService.createNotification({
        title: "Incoming Musher Transfer",
        message: `${musher.name} is being transferred to your club (${dogCount} dog${dogCount === 1 ? "" : "s"}). Please review and accept.`,
        type: "MUSHER_TRANSFER",
        userId: destinationClubId,
        eventId: newForm._id.toString(),
      });
    } catch (notifError) {
      logger.error(
        `Failed to notify destination club of transfer: ${notifError instanceof Error ? notifError.message : "Unknown error"}`
      );
    }

    logger.info(
      `Club transfer requested for musher ${musherId}: ${sourceClubId} → ${destinationClubId}`
    );
    return newForm;
  }

  async findFormById(input: FindFormByIdInput, user: User) {
    const error = " Form with the given Id does not exist";
    const isAdmin = user.role === "ADMIN";
    try {
      if (!user || !isAdmin) {
        throw new ApolloError(
          "Unauthorized: Only admin can access this resource"
        );
      }

      const form = await FormModel.findById(input.formId).lean();
      if (!form) {
        throw new ApolloError(error);
      }

      // Ensure all required fields are present
      // For musher registration forms, file is not required
      if (!form.formName || !form.formType || (!form.file && form.formType !== "new" && form.formType !== "renewal" && form.formType !== "change")) {
        throw new ApolloError("Invalid form data");
      }

      return form;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Internal sever error ");
    }
  }

  async updateForm(input: UpdateFormInput, user: User, formId: String) {
       const isAdmin = user.role === "ADMIN";

    try {
      if (!isAdmin) {
        throw new ApolloError(
          "Unauthorized: Only admin can access this resource"
        );
      }

      // If there's a new file, upload it to S3
      let fileUrl: string | undefined = input.file;
      if (input.file && input.file.startsWith("data:")) {
        const uploadedUrl = await uploadFile(
          input.file,
          `${user._id}-${Date.now()}`,
          "forms/"
        );
        
        if (!uploadedUrl) {
          throw new ApolloError("Failed to upload file to S3");
        }
        
        fileUrl = uploadedUrl;
      }

      // Find and update the form
      const form = await FormModel.findOneAndUpdate(
        { _id: formId },
        { 
          $set: {
            ...input,
            file: fileUrl
          }
        },
        { new: true }
      );

      if (!form) {
        throw new ApolloError("Form not found or update failed");
      }

      return form;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error ");
    }
  }

  async deleteForm(user: User, formId: String) {
    try {
      const isAdmin = user.role === "ADMIN";

      if (!user || !isAdmin) {
        throw new ApolloError("Unauthorized: Only admin can delete this form");
      }

      const deletedForm = await FormModel.findByIdAndDelete(formId).lean();
      
      if (!deletedForm) {
        throw new ApolloError("Form not found");
      }

      return deletedForm;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async updateFormStatus(formId: string, status: string, user: User) {
    try {
      if (user.role !== "ADMIN" && user.role !== "CLUB") {
        throw new ApolloError("Unauthorized: Only admins and club users can update form status");
      }

      if (!["pending", "approved", "declined"].includes(status)) {
        throw new ApolloError("Invalid status value");
      }

      const form = await FormModel.findById(formId);
      if (!form) {
        throw new ApolloError("Form not found");
      }

      if (form.formType === "change") {
        return await this.handleChangeFormStatus(
          form as Form & { save(): Promise<unknown> },
          status,
          user
        );
      }

      if (user.role === "CLUB" && form.club !== userClubId(user)) {
        throw new ApolloError("Unauthorized: You can only update forms for your own club");
      }

      form.status = status;

      if (status === "approved") {
        await this.applyApprovedMusherForm(form);
      }

      await form.save();
      return form;
    } catch (error) {
      logger.error(`Error updating form status: ${error instanceof Error ? error.message : "Unknown error"}`);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Failed to update form status");
    }
  }

  private async handleChangeFormStatus(
    // Mongoose document from FormModel.findById
    form: Form & { save(): Promise<unknown> },
    status: string,
    user: User
  ) {
    if (!userCanActOnChangeForm(form, user)) {
      throw new ApolloError("Unauthorized: You are not involved in this transfer");
    }

    const side = approvalSideForUser(form, user);
    if (!side) {
      throw new ApolloError("Unauthorized: You cannot act on this transfer");
    }

    if (status === "declined") {
      if (side === "from" || side === "admin") {
        form.fromClubApproval = "declined";
      }
      if (side === "to" || side === "admin") {
        form.toClubApproval = "declined";
      }
      form.status = "declined";
      await form.save();
      await this.notifyTransferDeclined(form, user);
      return form;
    }

    if (status === "approved") {
      if (side === "from" || side === "admin") {
        if (form.fromClubApproval !== "approved") {
          form.fromClubApproval = "approved";
        }
      }
      if (side === "to" || side === "admin") {
        if (form.toClubApproval !== "approved") {
          form.toClubApproval = "approved";
        }
      }

      if (!bothClubsApproved(form)) {
        form.status = "pending";
        await form.save();
        await this.notifyPartialTransferApproval(form, user);
        return form;
      }

      await this.executeMusherTransfer(form);
      form.status = "approved";
      await form.save();
      await this.notifyTransferCompleted(form);
      return form;
    }

    form.status = status;
    await form.save();
    return form;
  }

  private async findMusherForChangeForm(form: Form) {
    const MusherModel = getModelForClass(Musher);

    if (form.musherId) {
      const byId = await MusherModel.findById(form.musherId);
      if (byId) return byId;
    }

    if (form.nzfssRegistrationNumber) {
      const byReg = await MusherModel.findOne({ registrationNo: form.nzfssRegistrationNumber });
      if (byReg) return byReg;
    }

    if (form.firstName && form.surname) {
      const searchName = `${form.firstName} ${form.surname}`.trim();
      const byName = await MusherModel.findOne({
        name: { $regex: new RegExp(`^${searchName}$`, "i") },
      });
      if (byName) return byName;
    }

    if (form.applicantName) {
      const byApplicant = await MusherModel.findOne({
        name: { $regex: new RegExp(`^${form.applicantName.trim()}$`, "i") },
      });
      if (byApplicant) return byApplicant;
    }

    return null;
  }

  private async executeMusherTransfer(form: Form) {
    const MusherModel = getModelForClass(Musher);
    const existingMusher = await this.findMusherForChangeForm(form);

    if (!existingMusher) {
      throw new ApolloError("Musher not found for transfer");
    }

    if (!form.affiliationTo) {
      throw new ApolloError("Destination club is required for transfer");
    }

    const oldClubId = existingMusher.club?.toString();
    const isClubInitiated = !!form.musherId;

    const constructedName = `${form.firstName || ""} ${form.surname || ""}`.trim();
    if (constructedName && !isClubInitiated) {
      existingMusher.name = constructedName;
    } else if (form.applicantName?.trim() && !isClubInitiated) {
      existingMusher.name = form.applicantName.trim();
    }

    if (!isClubInitiated) {
      if (form.address) existingMusher.address = form.address;
      if (form.phone) existingMusher.phone = form.phone;
      if (form.email) existingMusher.email = form.email;
      if (form.dateOfBirth) existingMusher.dateOfBirth = form.dateOfBirth;
      if (form.guardianDetails) existingMusher.guardianDetails = form.guardianDetails;
      if (form.showProfileConsent !== undefined && form.showProfileConsent !== null) {
        existingMusher.showProfileConsent = form.showProfileConsent;
      }
    }

    existingMusher.registrationNo =
      form.nzfssRegistrationNumber || existingMusher.registrationNo;
    existingMusher.club = form.affiliationTo;

    if (!isClubInitiated && form.dogs && form.dogs.length > 0) {
      const formDogInputs = form.dogs.map(mapFormDogToMusherInput);
      const existingDogs = ensureDogIdsOnStoredDogs(existingMusher.dogs || []);
      const lookup = buildDogLookup(existingDogs);
      const uniqueNewInputs = formDogInputs.filter((dog) => !findExistingDog(dog, lookup));
      const uniqueNewDogs = processDogsForCreate(uniqueNewInputs);
      existingMusher.dogs = [...existingDogs, ...uniqueNewDogs] as typeof existingMusher.dogs;
    }

    await existingMusher.save();
    logger.info(
      `Transferred musher ${existingMusher._id} from ${oldClubId} to ${form.affiliationTo}`
    );
  }

  private async notifyPartialTransferApproval(form: Form, user: User) {
    const side = approvalSideForUser(form, user);
    const musherLabel = form.applicantName || `${form.firstName || ""} ${form.surname || ""}`.trim();
    const otherClubId =
      side === "from" ? form.affiliationTo : side === "to" ? form.affiliationFrom : undefined;

    if (!otherClubId) return;

    try {
      await this.notificationService.createNotification({
        title: "Transfer Awaiting Your Approval",
        message: `${musherLabel} transfer: one club has approved. Your approval is still required.`,
        type: "MUSHER_TRANSFER",
        userId: otherClubId,
        eventId: form._id.toString(),
      });
    } catch (err) {
      logger.error(`Failed partial transfer notification: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  }

  private async notifyTransferDeclined(form: Form, user: User) {
    const musherLabel = form.applicantName || `${form.firstName || ""} ${form.surname || ""}`.trim();
    const actorClubId = userClubId(user);
    const notifyIds = new Set<string>();
    if (form.affiliationFrom && form.affiliationFrom !== actorClubId) {
      notifyIds.add(form.affiliationFrom);
    }
    if (form.affiliationTo && form.affiliationTo !== actorClubId) {
      notifyIds.add(form.affiliationTo);
    }

    for (const clubUserId of notifyIds) {
      try {
        await this.notificationService.createNotification({
          title: "Musher Transfer Declined",
          message: `The transfer request for ${musherLabel} has been declined.`,
          type: "MUSHER_TRANSFER",
          userId: clubUserId,
          eventId: form._id.toString(),
        });
      } catch (err) {
        logger.error(`Failed decline notification: ${err instanceof Error ? err.message : "Unknown"}`);
      }
    }
  }

  private async notifyTransferCompleted(form: Form) {
    const musherLabel = form.applicantName || `${form.firstName || ""} ${form.surname || ""}`.trim();
    const notifyIds = new Set<string>();
    if (form.affiliationFrom) notifyIds.add(form.affiliationFrom);
    if (form.affiliationTo) notifyIds.add(form.affiliationTo);

    for (const clubUserId of notifyIds) {
      try {
        await this.notificationService.createNotification({
          title: "Musher Transfer Complete",
          message: `${musherLabel} has been transferred between clubs. NZFSS registration numbers are unchanged.`,
          type: "MUSHER_TRANSFER",
          userId: clubUserId,
          eventId: form._id.toString(),
        });
      } catch (err) {
        logger.error(`Failed completion notification: ${err instanceof Error ? err.message : "Unknown"}`);
      }
    }
  }

  private async applyApprovedMusherForm(form: Form) {
    try {
      const MusherModel = getModelForClass(Musher);

      if (form.formType === "new") {
        const musherName = `${form.firstName} ${form.surname}`.trim();
        const newDogs = processDogsForCreate((form.dogs || []).map(mapFormDogToMusherInput));

        let existingMusher = null;

        if (form.nzfssRegistrationNumber) {
          existingMusher = await MusherModel.findOne({
            registrationNo: form.nzfssRegistrationNumber,
          });
        }

        if (!existingMusher && musherName) {
          existingMusher = await MusherModel.findOne({
            name: { $regex: new RegExp(`^${musherName}$`, "i") },
            club: form.club,
          });
        }

        if (existingMusher) {
          existingMusher.name = musherName || existingMusher.name;
          existingMusher.registrationNo =
            form.nzfssRegistrationNumber || existingMusher.registrationNo;
          existingMusher.address = form.address || existingMusher.address || "";
          existingMusher.phone = form.phone || existingMusher.phone || "";
          existingMusher.email = form.email || existingMusher.email || "";
          existingMusher.dateOfBirth = form.dateOfBirth || existingMusher.dateOfBirth || "";
          existingMusher.guardianDetails =
            form.guardianDetails || existingMusher.guardianDetails || "";
          if (form.showProfileConsent !== undefined && form.showProfileConsent !== null) {
            existingMusher.showProfileConsent = form.showProfileConsent;
          }
          if (newDogs.length > 0) {
            existingMusher.dogs = newDogs;
          }
          await existingMusher.save();
          logger.info(`Updated existing musher record for approved new form: ${existingMusher._id}`);
        } else {
          const newMusher = await MusherModel.create({
            name: musherName,
            registrationNo: form.nzfssRegistrationNumber || "",
            kennelRegistrationNo: "",
            club: form.club,
            address: form.address || "",
            phone: form.phone || "",
            email: form.email || "",
            dateOfBirth: form.dateOfBirth || "",
            guardianDetails: form.guardianDetails || "",
            showProfileConsent: form.showProfileConsent || false,
            dogs: newDogs,
          });

          logger.info(`Created new musher record for approved form: ${newMusher._id}`);
        }
      } else if (form.formType === "renewal") {
        const existingMusher = await this.findMusherForChangeForm(form);

        if (existingMusher) {
          const constructedName = `${form.firstName || ""} ${form.surname || ""}`.trim();
          if (constructedName) {
            existingMusher.name = constructedName;
          } else if (form.applicantName?.trim()) {
            existingMusher.name = form.applicantName.trim();
          }
          existingMusher.registrationNo =
            form.nzfssRegistrationNumber || existingMusher.registrationNo;
          if (form.address) existingMusher.address = form.address;
          if (form.phone) existingMusher.phone = form.phone;
          if (form.email) existingMusher.email = form.email;
          if (form.dateOfBirth) existingMusher.dateOfBirth = form.dateOfBirth;
          if (form.guardianDetails) existingMusher.guardianDetails = form.guardianDetails;
          if (form.showProfileConsent !== undefined && form.showProfileConsent !== null) {
            existingMusher.showProfileConsent = form.showProfileConsent;
          }
          existingMusher.club = form.club || existingMusher.club;

          if (form.dogs && form.dogs.length > 0) {
            const formDogInputs = form.dogs.map(mapFormDogToMusherInput);
            const existingDogs = ensureDogIdsOnStoredDogs(existingMusher.dogs || []);
            const hasRealDogs = formDogInputs.some((dog) => dog.name?.trim());
            if (hasRealDogs) {
              existingMusher.dogs = processDogsForUpdate(formDogInputs, existingDogs) as typeof existingMusher.dogs;
            } else {
              existingMusher.dogs = existingDogs as typeof existingMusher.dogs;
            }
          }

          await existingMusher.save();
          logger.info(`Updated existing musher record: ${existingMusher._id} for renewal form`);
        } else {
          const newMusher = await MusherModel.create({
            name: `${form.firstName} ${form.surname}`.trim(),
            registrationNo: form.nzfssRegistrationNumber || "",
            kennelRegistrationNo: "",
            club: form.club,
            address: form.address || "",
            phone: form.phone || "",
            email: form.email || "",
            dateOfBirth: form.dateOfBirth || "",
            guardianDetails: form.guardianDetails || "",
            showProfileConsent: form.showProfileConsent || false,
            dogs: processDogsForCreate((form.dogs || []).map(mapFormDogToMusherInput)),
          });

          logger.info(`No existing musher found for renewal form, created: ${newMusher._id}`);
        }
      }
    } catch (error) {
      logger.error(
        `Error handling musher record for ${form.formType} form: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
