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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormService = void 0;
const apollo_server_1 = require("apollo-server");
const helpers_1 = require("../utils/helpers");
const logger_1 = require("../utils/logger");
const form_schema_1 = require("../schema/form.schema");
const s3Upload_1 = __importDefault(require("../utils/s3Upload"));
const musher_schema_1 = require("../schema/musher.schema");
const typegoose_1 = require("@typegoose/typegoose");
const notification_service_1 = require("./notification.service");
const club_schema_1 = require("../schema/club.schema");
const email_service_1 = require("./email.service");
class FormService {
    constructor() {
        this.notificationService = new notification_service_1.NotificationService();
        this.emailService = new email_service_1.EmailService();
    }
    async createForm(input, user) {
        const adminErr = "Only admin can add a Form";
        try {
            const isMusherRegistration = input.formType === "new" || input.formType === "renewal" || input.formType === "change";
            if (!isMusherRegistration) {
                const adminUser = user;
                if (!adminUser || !(0, helpers_1.isAdmin)(adminUser.role)) {
                    throw new apollo_server_1.ApolloError(adminErr);
                }
            }
            let fileUrl = undefined;
            if (input.file) {
                try {
                    logger_1.logger.info(`FormService: Processing file upload. Length: ${input.file.length}`);
                    logger_1.logger.info(`FormService: File prefix: "${input.file.substring(0, 50)}"`);
                    if (!input.file.startsWith("data:")) {
                        if (input.file.includes("data:")) {
                            const dataIndex = input.file.indexOf("data:");
                            logger_1.logger.info(`FormService: Found 'data:' at position ${dataIndex}, extracting valid part`);
                            input.file = input.file.substring(dataIndex);
                        }
                        else if (input.file.startsWith("http")) {
                            logger_1.logger.info(`FormService: File appears to be a URL, not base64. Using directly: ${input.file.substring(0, 50)}`);
                            fileUrl = input.file;
                            const newForm = await form_schema_1.FormModel.create({
                                formName: input.formName,
                                formType: input.formType,
                                file: fileUrl,
                                fileName: input.fileName
                            });
                            return newForm;
                        }
                        else if (/^[A-Za-z0-9+/=]+$/.test(input.file.substring(0, 20))) {
                            logger_1.logger.info("FormService: Raw base64 detected, adding PDF prefix");
                            input.file = `data:application/pdf;base64,${input.file}`;
                        }
                        else {
                            throw new apollo_server_1.ApolloError("Invalid file format: File must be properly base64 encoded with data URI prefix");
                        }
                    }
                    const uploadedUrl = await (0, s3Upload_1.default)(input.file, `${user._id}-${Date.now()}`, "forms/");
                    if (!uploadedUrl) {
                        throw new apollo_server_1.ApolloError("Failed to upload file to S3");
                    }
                    fileUrl = uploadedUrl;
                    logger_1.logger.info(`FormService: File uploaded successfully. URL: ${fileUrl}`);
                }
                catch (error) {
                    logger_1.logger.error(`FormService: Upload error: ${error instanceof Error ? error.message : "Unknown error"}`);
                    throw new apollo_server_1.ApolloError(`File upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
                }
            }
            try {
                logger_1.logger.info(`FormService: Creating form entry in database: ${input.formName}`);
                logger_1.logger.info(`FormService: Form input data:`, {
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
                const newForm = await form_schema_1.FormModel.create({
                    formName: input.formName,
                    formType: input.formType,
                    file: fileUrl,
                    fileName: input.fileName,
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
                if (input.formType === "new" && input.club) {
                    try {
                        let clubEmail;
                        const clubUser = await (await Promise.resolve().then(() => __importStar(require('../schema/user.schema')))).UserModel.findById(input.club).lean();
                        if (clubUser?.email)
                            clubEmail = clubUser.email;
                        if (!clubEmail) {
                            const club = await club_schema_1.ClubModel.findById(input.club).lean();
                            if (club?.email)
                                clubEmail = club.email;
                        }
                        if (clubEmail) {
                            try {
                                await this.emailService.sendFormNotification(clubEmail, {
                                    applicantName: `${input.firstName} ${input.surname}`,
                                    formType: input.formType,
                                    email: input.email || '',
                                    phone: input.phone || '',
                                });
                                logger_1.logger.info(`Form notification email sent successfully to club ${clubEmail}`);
                            }
                            catch (emailError) {
                                logger_1.logger.error('Failed to send form notification email:', emailError);
                                await this.notificationService.createNotification({
                                    title: "Email Notification Failed",
                                    message: `Failed to send email notification for new musher registration to ${clubEmail ?? 'unknown email'}`,
                                    type: "SYSTEM_ERROR",
                                    userId: input.club,
                                    eventId: newForm._id.toString()
                                });
                            }
                        }
                        else {
                            logger_1.logger.warn(`Club ${input.club} has no email address configured`);
                        }
                    }
                    catch (error) {
                        logger_1.logger.error('Error processing club email notification:', error);
                    }
                }
                logger_1.logger.info(`FormService: Form created successfully with ID: ${newForm._id}`);
                if (isMusherRegistration && input.club) {
                    try {
                        await this.notificationService.createNotification({
                            title: "New Musher Registration",
                            message: `New ${input.formType} form submitted by ${input.applicantName || `${input.firstName} ${input.surname}`}`,
                            type: "MUSHER_SUBMISSION",
                            userId: input.club,
                            eventId: newForm._id.toString()
                        });
                        logger_1.logger.info(`FormService: Created notification for club ${input.club}`);
                    }
                    catch (notifError) {
                        logger_1.logger.error(`FormService: Failed to create notification: ${notifError instanceof Error ? notifError.message : "Unknown error"}`);
                    }
                }
                return newForm;
            }
            catch (dbError) {
                logger_1.logger.error(`FormService: Database error: ${dbError instanceof Error ? dbError.message : "Unknown error"}`);
                throw new apollo_server_1.ApolloError(`Database error creating form: ${dbError instanceof Error ? dbError.message : "Unknown error"}`);
            }
        }
        catch (error) {
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            logger_1.logger.error(`FormService error: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw new apollo_server_1.ApolloError("An unexpected error occurred while creating the form");
        }
    }
    async getAllForms(user) {
        try {
            if (user && user.role !== "ADMIN" && user.role !== "CLUB") {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin or club users can access this resource");
            }
            const forms = await form_schema_1.FormModel.find({
                formType: { $nin: ["new", "renewal", "change"] }
            }).lean();
            const validForms = forms.filter(form => form.formName &&
                form.formType &&
                form.file);
            return validForms;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async getForms(user, formType, status, clubId) {
        try {
            if (!user || (user.role !== "ADMIN" && user.role !== "CLUB")) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin or club users can access this resource");
            }
            const query = {};
            if (formType) {
                query.formType = formType;
            }
            if (status) {
                query.status = status;
            }
            if (clubId) {
                query.club = clubId;
            }
            const forms = await form_schema_1.FormModel.find(query)
                .populate({ path: 'club', select: 'name' })
                .lean();
            return forms;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Error retrieving forms");
        }
    }
    async findFormById(input, user) {
        const error = " Form with the given Id does not exist";
        const isAdmin = user.role === "ADMIN";
        try {
            if (!user || !isAdmin) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin can access this resource");
            }
            const form = await form_schema_1.FormModel.findById(input.formId).lean();
            if (!form) {
                throw new apollo_server_1.ApolloError(error);
            }
            if (!form.formName || !form.formType || (!form.file && form.formType !== "new" && form.formType !== "renewal" && form.formType !== "change")) {
                throw new apollo_server_1.ApolloError("Invalid form data");
            }
            return form;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async updateForm(input, user, formId) {
        const isAdmin = user.role === "ADMIN";
        try {
            if (!isAdmin) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin can access this resource");
            }
            let fileUrl = input.file;
            if (input.file && input.file.startsWith("data:")) {
                const uploadedUrl = await (0, s3Upload_1.default)(input.file, `${user._id}-${Date.now()}`, "forms/");
                if (!uploadedUrl) {
                    throw new apollo_server_1.ApolloError("Failed to upload file to S3");
                }
                fileUrl = uploadedUrl;
            }
            const form = await form_schema_1.FormModel.findOneAndUpdate({ _id: formId }, {
                $set: {
                    ...input,
                    file: fileUrl
                }
            }, { new: true });
            if (!form) {
                throw new apollo_server_1.ApolloError("Form not found or update failed");
            }
            return form;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error ");
        }
    }
    async deleteForm(user, formId) {
        try {
            const isAdmin = user.role === "ADMIN";
            if (!user || !isAdmin) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin can delete this form");
            }
            const deletedForm = await form_schema_1.FormModel.findByIdAndDelete(formId).lean();
            if (!deletedForm) {
                throw new apollo_server_1.ApolloError("Form not found");
            }
            return deletedForm;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async updateFormStatus(formId, status, user) {
        try {
            if (user.role !== "ADMIN" && user.role !== "CLUB") {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admins and club users can update form status");
            }
            if (!["pending", "approved", "declined"].includes(status)) {
                throw new apollo_server_1.ApolloError("Invalid status value");
            }
            const form = await form_schema_1.FormModel.findById(formId);
            if (!form) {
                throw new apollo_server_1.ApolloError("Form not found");
            }
            if (user.role === "CLUB" && form.club !== user._id.toString()) {
                throw new apollo_server_1.ApolloError("Unauthorized: You can only update forms for your own club");
            }
            form.status = status;
            if (status === "approved") {
                try {
                    const MusherModel = (0, typegoose_1.getModelForClass)(musher_schema_1.Musher);
                    if (form.formType === "new") {
                        const newMusher = await MusherModel.create({
                            name: `${form.firstName} ${form.surname}`.trim(),
                            registrationNo: form.nzfssRegistrationNumber || "",
                            kennelRegistrationNo: "",
                            club: form.club,
                            showProfileConsent: form.showProfileConsent || false,
                            dogs: form.dogs?.map((dog) => ({
                                name: dog.petName,
                                pedigreeName: dog.pedigreeName || "",
                                nzkcNo: dog.nzkcRegistration || "",
                                nzfssNo: dog.nzfssNumber || "",
                                dateOfBirth: dog.dateOfBirth || "",
                                breed: dog.breed || "",
                                deceased: dog.isDeceased || false
                            })) || []
                        });
                        logger_1.logger.info(`Created new musher record for approved form: ${newMusher._id}`);
                    }
                    else if (form.formType === "renewal" || form.formType === "change") {
                        let existingMusher = null;
                        logger_1.logger.info(`Looking for existing musher for ${form.formType} form:`);
                        logger_1.logger.info(`  - Registration number: ${form.nzfssRegistrationNumber}`);
                        logger_1.logger.info(`  - Name: ${form.firstName} ${form.surname}`);
                        logger_1.logger.info(`  - Applicant name: ${form.applicantName}`);
                        if (form.nzfssRegistrationNumber) {
                            existingMusher = await MusherModel.findOne({
                                registrationNo: form.nzfssRegistrationNumber
                            });
                            logger_1.logger.info(`Search by registration number result: ${existingMusher ? `Found ${existingMusher._id}` : 'Not found'}`);
                        }
                        if (!existingMusher && form.firstName && form.surname) {
                            const searchName = `${form.firstName} ${form.surname}`.trim();
                            existingMusher = await MusherModel.findOne({
                                name: { $regex: new RegExp(`^${searchName}$`, 'i') }
                            });
                            logger_1.logger.info(`Search by constructed name "${searchName}" (case-insensitive) result: ${existingMusher ? `Found ${existingMusher._id}` : 'Not found'}`);
                        }
                        if (!existingMusher && form.formType === "renewal" && form.applicantName) {
                            existingMusher = await MusherModel.findOne({
                                name: { $regex: new RegExp(`^${form.applicantName.trim()}$`, 'i') }
                            });
                            logger_1.logger.info(`Search by applicant name "${form.applicantName}" (case-insensitive) result: ${existingMusher ? `Found ${existingMusher._id}` : 'Not found'}`);
                        }
                        if (!existingMusher && form.formType === "change" && form.applicantName) {
                            existingMusher = await MusherModel.findOne({
                                name: { $regex: new RegExp(`^${form.applicantName.trim()}$`, 'i') }
                            });
                            logger_1.logger.info(`Search by change form applicant name "${form.applicantName}" (case-insensitive) result: ${existingMusher ? `Found ${existingMusher._id}` : 'Not found'}`);
                        }
                        if (existingMusher) {
                            const oldClubId = existingMusher.club;
                            logger_1.logger.info(`Updating musher ${existingMusher.name} - Current consent: ${existingMusher.showProfileConsent}, Form consent: ${form.showProfileConsent}`);
                            existingMusher.name = `${form.firstName} ${form.surname}`.trim();
                            existingMusher.registrationNo = form.nzfssRegistrationNumber || existingMusher.registrationNo;
                            if (form.showProfileConsent !== undefined && form.showProfileConsent !== null) {
                                existingMusher.showProfileConsent = form.showProfileConsent;
                                logger_1.logger.info(`Updated consent field to: ${existingMusher.showProfileConsent}`);
                            }
                            else {
                                logger_1.logger.info(`No consent value in form, keeping existing: ${existingMusher.showProfileConsent}`);
                            }
                            if (form.formType === "change") {
                                if (form.affiliationTo) {
                                    existingMusher.club = form.affiliationTo;
                                    logger_1.logger.info(`Updated musher ${existingMusher.name} club affiliation from ${oldClubId} to ${form.affiliationTo}`);
                                    if (form.affiliationFrom && form.affiliationTo) {
                                        logger_1.logger.info(`Club affiliation change: ${form.affiliationFrom} → ${form.affiliationTo}`);
                                    }
                                }
                                else {
                                    logger_1.logger.warn(`Change form approved but no destination club specified for musher ${existingMusher.name}`);
                                }
                            }
                            else {
                                existingMusher.club = form.club || existingMusher.club;
                            }
                            if (form.dogs && form.dogs.length > 0) {
                                const newDogs = form.dogs.map((dog) => ({
                                    name: dog.petName,
                                    pedigreeName: dog.pedigreeName || "",
                                    nzkcNo: dog.nzkcRegistration || "",
                                    nzfssNo: dog.nzfssNumber || "",
                                    dateOfBirth: dog.dateOfBirth || "",
                                    breed: dog.breed || "",
                                    deceased: dog.isDeceased || false
                                }));
                                if (form.formType === "change") {
                                    const existingDogs = existingMusher.dogs || [];
                                    const existingDogNames = new Set(existingDogs.map(dog => dog.name?.toLowerCase()));
                                    const existingNzfssNumbers = new Set(existingDogs.map(dog => dog.nzfssNo).filter(num => num));
                                    const uniqueNewDogs = newDogs.filter(newDog => {
                                        const nameExists = newDog.name && existingDogNames.has(newDog.name.toLowerCase());
                                        const nzfssExists = newDog.nzfssNo && existingNzfssNumbers.has(newDog.nzfssNo);
                                        return !nameExists && !nzfssExists;
                                    });
                                    logger_1.logger.info(`Appending ${uniqueNewDogs.length} new unique dogs (${newDogs.length - uniqueNewDogs.length} duplicates filtered out) to existing ${existingDogs.length} dogs for change form`);
                                    existingMusher.dogs = [...existingDogs, ...uniqueNewDogs];
                                    logger_1.logger.info(`Total dogs after addition: ${existingMusher.dogs.length}`);
                                }
                                else {
                                    logger_1.logger.info(`Replacing ${existingMusher.dogs?.length || 0} existing dogs with ${newDogs.length} new dogs for ${form.formType} form`);
                                    existingMusher.dogs = newDogs;
                                }
                            }
                            await existingMusher.save();
                            logger_1.logger.info(`Updated existing musher record: ${existingMusher._id} for ${form.formType} form`);
                            logger_1.logger.info(`Final musher consent value after save: ${existingMusher.showProfileConsent}`);
                            const verifyMusher = await MusherModel.findById(existingMusher._id);
                            if (verifyMusher) {
                                logger_1.logger.info(`Database verification - consent value: ${verifyMusher.showProfileConsent}`);
                                if (verifyMusher.showProfileConsent !== existingMusher.showProfileConsent) {
                                    logger_1.logger.error(`Database mismatch! Expected: ${existingMusher.showProfileConsent}, Found: ${verifyMusher.showProfileConsent}`);
                                }
                            }
                            else {
                                logger_1.logger.error(`Could not find musher ${existingMusher._id} for verification`);
                            }
                            if (form.formType === "change" && oldClubId !== existingMusher.club) {
                                try {
                                    if (oldClubId) {
                                        await this.notificationService.createNotification({
                                            title: "Musher Affiliation Change",
                                            message: `${existingMusher.name} has transferred from your club to another club`,
                                            type: "MUSHER_TRANSFER",
                                            userId: oldClubId,
                                            eventId: form._id.toString()
                                        });
                                    }
                                    if (existingMusher.club) {
                                        await this.notificationService.createNotification({
                                            title: "New Musher Transfer",
                                            message: `${existingMusher.name} has transferred to your club from ${form.affiliationFrom || 'another club'}`,
                                            type: "MUSHER_TRANSFER",
                                            userId: existingMusher.club,
                                            eventId: form._id.toString()
                                        });
                                    }
                                    logger_1.logger.info(`Created transfer notifications for musher ${existingMusher.name} club change`);
                                }
                                catch (notifError) {
                                    logger_1.logger.error(`Failed to create transfer notifications: ${notifError instanceof Error ? notifError.message : "Unknown error"}`);
                                }
                            }
                        }
                        else {
                            const newMusher = await MusherModel.create({
                                name: `${form.firstName} ${form.surname}`.trim(),
                                registrationNo: form.nzfssRegistrationNumber || "",
                                kennelRegistrationNo: "",
                                club: form.club,
                                showProfileConsent: form.showProfileConsent || false,
                                dogs: form.dogs?.map((dog) => ({
                                    name: dog.petName,
                                    pedigreeName: dog.pedigreeName || "",
                                    nzkcNo: dog.nzkcRegistration || "",
                                    nzfssNo: dog.nzfssNumber || "",
                                    dateOfBirth: dog.dateOfBirth || "",
                                    breed: dog.breed || "",
                                    deceased: dog.isDeceased || false
                                })) || []
                            });
                            logger_1.logger.info(`No existing musher found for ${form.formType} form, created new record: ${newMusher._id}`);
                        }
                    }
                }
                catch (error) {
                    logger_1.logger.error(`Error handling musher record for ${form.formType} form: ${error instanceof Error ? error.message : "Unknown error"}`);
                }
            }
            await form.save();
            return form;
        }
        catch (error) {
            logger_1.logger.error(`Error updating form status: ${error instanceof Error ? error.message : "Unknown error"}`);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Failed to update form status");
        }
    }
}
exports.FormService = FormService;
//# sourceMappingURL=form.service.js.map