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
          club: input.club,
          affiliationFrom: input.affiliationFrom,
          affiliationTo: input.affiliationTo,
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
        if (isMusherRegistration && input.club) {
          try {
            // Create notification for the club (using club ID as userId)
            await this.notificationService.createNotification({
              title: "New Musher Registration",
              message: `New ${input.formType} form submitted by ${input.applicantName || `${input.firstName} ${input.surname}`}`,
              type: "MUSHER_SUBMISSION",
              userId: input.club, // Use club ID directly as userId
              eventId: newForm._id.toString()
            });
            logger.info(`FormService: Created notification for club ${input.club}`);
          } catch (notifError) {
            // Log but don't throw - notification failure shouldn't affect form submission
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
      // Only allow admins to access forms with filters
      if (!user || (user.role !== "ADMIN" && user.role !== "CLUB")) {
        throw new ApolloError("Unauthorized: Only admin or club users can access this resource");
      }

      // Build the query based on provided filters
      const query: any = {};
      if (formType) {
        query.formType = formType;
      }
      if (status) {
        query.status = status;
      }
      if (clubId) {
        query.club = clubId;
      }

      // Fetch filtered forms
      const forms = await FormModel.find(query)
        .populate({ path: 'club', select: 'name' })
        .lean();

      return forms;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Error retrieving forms");
    }
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
      // Check permission - allow both admins and club users
      if (user.role !== "ADMIN" && user.role !== "CLUB") {
        throw new ApolloError("Unauthorized: Only admins and club users can update form status");
      }

      // Validate status
      if (!["pending", "approved", "declined"].includes(status)) {
        throw new ApolloError("Invalid status value");
      }

      // Find form by ID
      const form = await FormModel.findById(formId);
      if (!form) {
        throw new ApolloError("Form not found");
      }

      // If user is a club user, verify they can only update forms for their club
      if (user.role === "CLUB" && form.club !== user._id.toString()) {
        throw new ApolloError("Unauthorized: You can only update forms for your own club");
      }

      // Update status
      form.status = status;

      // If the form is being approved, handle musher record creation/update based on form type
      if (status === "approved") {
        try {
          const MusherModel = getModelForClass(Musher);
          
          if (form.formType === "new") {
            // Create a new musher record for new registrations
            const newMusher = await MusherModel.create({
              name: `${form.firstName} ${form.surname}`.trim(),
              registrationNo: form.nzfssRegistrationNumber || "",
              kennelRegistrationNo: "", // This can be updated later if needed
              club: form.club,
              showProfileConsent: form.showProfileConsent || false,
              dogs: form.dogs?.map((dog: any) => ({
                name: dog.petName,
                pedigreeName: dog.pedigreeName || "",
                nzkcNo: dog.nzkcRegistration || "",
                nzfssNo: dog.nzfssNumber || "",
                dateOfBirth: dog.dateOfBirth || "",
                breed: dog.breed || "",
                deceased: dog.isDeceased || false
              })) || []
            });

            logger.info(`Created new musher record for approved form: ${newMusher._id}`);
                      } else if (form.formType === "renewal" || form.formType === "change") {
            // Find existing musher by registration number or name
            let existingMusher = null;
            
            logger.info(`Looking for existing musher for ${form.formType} form:`);
            logger.info(`  - Registration number: ${form.nzfssRegistrationNumber}`);
            logger.info(`  - Name: ${form.firstName} ${form.surname}`);
            logger.info(`  - Applicant name: ${form.applicantName}`);
            
            if (form.nzfssRegistrationNumber) {
              existingMusher = await MusherModel.findOne({ 
                registrationNo: form.nzfssRegistrationNumber 
              });
              logger.info(`Search by registration number result: ${existingMusher ? `Found ${existingMusher._id}` : 'Not found'}`);
            }
            
            // If not found by registration number, try by name (case-insensitive)
            if (!existingMusher && form.firstName && form.surname) {
              const searchName = `${form.firstName} ${form.surname}`.trim();
              existingMusher = await MusherModel.findOne({
                name: { $regex: new RegExp(`^${searchName}$`, 'i') }
              });
              logger.info(`Search by constructed name "${searchName}" (case-insensitive) result: ${existingMusher ? `Found ${existingMusher._id}` : 'Not found'}`);
            }
            
            // For renewal forms, also try by applicant name (case-insensitive)
            if (!existingMusher && form.formType === "renewal" && form.applicantName) {
              existingMusher = await MusherModel.findOne({
                name: { $regex: new RegExp(`^${form.applicantName.trim()}$`, 'i') }
              });
              logger.info(`Search by applicant name "${form.applicantName}" (case-insensitive) result: ${existingMusher ? `Found ${existingMusher._id}` : 'Not found'}`);
            }
            
            // Additional fallback for change forms - try applicant name (case-insensitive)
            if (!existingMusher && form.formType === "change" && form.applicantName) {
              existingMusher = await MusherModel.findOne({
                name: { $regex: new RegExp(`^${form.applicantName.trim()}$`, 'i') }
              });
              logger.info(`Search by change form applicant name "${form.applicantName}" (case-insensitive) result: ${existingMusher ? `Found ${existingMusher._id}` : 'Not found'}`);
            }

            if (existingMusher) {
              // Store the old club ID for logging
              const oldClubId = existingMusher.club;
              
              // Log the consent update for debugging
              logger.info(`Updating musher ${existingMusher.name} - Current consent: ${existingMusher.showProfileConsent}, Form consent: ${form.showProfileConsent}`);
              
              // Update existing musher with new information
              existingMusher.name = `${form.firstName} ${form.surname}`.trim();
              existingMusher.registrationNo = form.nzfssRegistrationNumber || existingMusher.registrationNo;
              
              // Explicitly handle the consent field - prioritize form value over existing value
              if (form.showProfileConsent !== undefined && form.showProfileConsent !== null) {
                existingMusher.showProfileConsent = form.showProfileConsent;
                logger.info(`Updated consent field to: ${existingMusher.showProfileConsent}`);
              } else {
                logger.info(`No consent value in form, keeping existing: ${existingMusher.showProfileConsent}`);
              }
              
              // For change forms, handle club affiliation change
              if (form.formType === "change") {
                if (form.affiliationTo) {
                  // Update to the new club (form.affiliationTo contains the destination club ID)
                  existingMusher.club = form.affiliationTo;
                  logger.info(`Updated musher ${existingMusher.name} club affiliation from ${oldClubId} to ${form.affiliationTo}`);
                  
                  // Log the affiliation change details if available
                  if (form.affiliationFrom && form.affiliationTo) {
                    logger.info(`Club affiliation change: ${form.affiliationFrom} → ${form.affiliationTo}`);
                  }
                } else {
                  logger.warn(`Change form approved but no destination club specified for musher ${existingMusher.name}`);
                }
              } else {
                // For renewal forms, keep existing club or update if specified
                existingMusher.club = form.club || existingMusher.club;
              }
              
              // Handle dogs based on form type
              if (form.dogs && form.dogs.length > 0) {
                const newDogs = form.dogs.map((dog: any) => ({
                  name: dog.petName,
                  pedigreeName: dog.pedigreeName || "",
                  nzkcNo: dog.nzkcRegistration || "",
                  nzfssNo: dog.nzfssNumber || "",
                  dateOfBirth: dog.dateOfBirth || "",
                  breed: dog.breed || "",
                  deceased: dog.isDeceased || false
                }));

                if (form.formType === "change") {
                  // For change forms, append new dogs to existing dogs (avoid duplicates)
                  const existingDogs = existingMusher.dogs || [];
                  const existingDogNames = new Set(existingDogs.map(dog => dog.name?.toLowerCase()));
                  const existingNzfssNumbers = new Set(existingDogs.map(dog => dog.nzfssNo).filter(num => num));
                  
                  // Filter out duplicate dogs (by name or NZFSS number if available)
                  const uniqueNewDogs = newDogs.filter(newDog => {
                    const nameExists = newDog.name && existingDogNames.has(newDog.name.toLowerCase());
                    const nzfssExists = newDog.nzfssNo && existingNzfssNumbers.has(newDog.nzfssNo);
                    return !nameExists && !nzfssExists;
                  });
                  
                  logger.info(`Appending ${uniqueNewDogs.length} new unique dogs (${newDogs.length - uniqueNewDogs.length} duplicates filtered out) to existing ${existingDogs.length} dogs for change form`);
                  existingMusher.dogs = [...existingDogs, ...uniqueNewDogs];
                  logger.info(`Total dogs after addition: ${existingMusher.dogs.length}`);
                } else {
                  // For renewal forms, replace existing dogs with new ones from the form
                  logger.info(`Replacing ${existingMusher.dogs?.length || 0} existing dogs with ${newDogs.length} new dogs for ${form.formType} form`);
                  existingMusher.dogs = newDogs;
                }
              }

              await existingMusher.save();
              logger.info(`Updated existing musher record: ${existingMusher._id} for ${form.formType} form`);
              logger.info(`Final musher consent value after save: ${existingMusher.showProfileConsent}`);
              
              // Verify the update was actually saved to database
              const verifyMusher = await MusherModel.findById(existingMusher._id);
              if (verifyMusher) {
                logger.info(`Database verification - consent value: ${verifyMusher.showProfileConsent}`);
                if (verifyMusher.showProfileConsent !== existingMusher.showProfileConsent) {
                  logger.error(`Database mismatch! Expected: ${existingMusher.showProfileConsent}, Found: ${verifyMusher.showProfileConsent}`);
                }
              } else {
                logger.error(`Could not find musher ${existingMusher._id} for verification`);
              }
              
              // Create notifications for club affiliation changes
              if (form.formType === "change" && oldClubId !== existingMusher.club) {
                try {
                  // Notify the old club about the musher leaving
                  if (oldClubId) {
                    await this.notificationService.createNotification({
                      title: "Musher Affiliation Change",
                      message: `${existingMusher.name} has transferred from your club to another club`,
                      type: "MUSHER_TRANSFER",
                      userId: oldClubId,
                      eventId: form._id.toString()
                    });
                  }
                  
                  // Notify the new club about the musher joining
                  if (existingMusher.club) {
                    await this.notificationService.createNotification({
                      title: "New Musher Transfer",
                      message: `${existingMusher.name} has transferred to your club from ${form.affiliationFrom || 'another club'}`,
                      type: "MUSHER_TRANSFER",
                      userId: existingMusher.club,
                      eventId: form._id.toString()
                    });
                  }
                  
                  logger.info(`Created transfer notifications for musher ${existingMusher.name} club change`);
                } catch (notifError) {
                  logger.error(`Failed to create transfer notifications: ${notifError instanceof Error ? notifError.message : "Unknown error"}`);
                }
              }
            } else {
              // If no existing musher found, create a new one (fallback)
              const newMusher = await MusherModel.create({
                name: `${form.firstName} ${form.surname}`.trim(),
                registrationNo: form.nzfssRegistrationNumber || "",
                kennelRegistrationNo: "",
                club: form.club,
                showProfileConsent: form.showProfileConsent || false,
                dogs: form.dogs?.map((dog: any) => ({
                  name: dog.petName,
                  pedigreeName: dog.pedigreeName || "",
                  nzkcNo: dog.nzkcRegistration || "",
                  nzfssNo: dog.nzfssNumber || "",
                  dateOfBirth: dog.dateOfBirth || "",
                  breed: dog.breed || "",
                  deceased: dog.isDeceased || false
                })) || []
              });

              logger.info(`No existing musher found for ${form.formType} form, created new record: ${newMusher._id}`);
            }
          }
        } catch (error) {
          logger.error(`Error handling musher record for ${form.formType} form: ${error instanceof Error ? error.message : "Unknown error"}`);
          // Don't throw here - we still want to update the form status even if musher creation/update fails
          // The musher can be created/updated manually later if needed
        }
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
}
