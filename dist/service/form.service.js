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
const process_musher_dogs_1 = require("../utils/process-musher-dogs");
const dog_id_1 = require("../utils/dog-id");
function mapFormDogToMusherInput(dog) {
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
function mapMusherDogsToFormDogs(dogs = []) {
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
function bothClubsApproved(form) {
    return form.fromClubApproval === "approved" && form.toClubApproval === "approved";
}
function userClubId(user) {
    return user._id.toString();
}
function userCanActOnChangeForm(form, user) {
    if (user.role === "ADMIN")
        return true;
    if (user.role !== "CLUB")
        return false;
    const clubId = userClubId(user);
    return form.affiliationFrom === clubId || form.affiliationTo === clubId;
}
function approvalSideForUser(form, user) {
    if (user.role === "ADMIN")
        return "admin";
    const clubId = userClubId(user);
    if (form.affiliationFrom === clubId)
        return "from";
    if (form.affiliationTo === clubId)
        return "to";
    return null;
}
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
                const isChangeForm = input.formType === "change";
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
                if (isMusherRegistration) {
                    try {
                        if (isChangeForm) {
                            const musherLabel = input.applicantName || `${input.firstName || ""} ${input.surname || ""}`.trim();
                            const dogCount = input.dogs?.length || 0;
                            const notifyIds = new Set();
                            if (input.affiliationFrom)
                                notifyIds.add(input.affiliationFrom);
                            if (input.affiliationTo)
                                notifyIds.add(input.affiliationTo);
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
                            logger_1.logger.info(`FormService: Created transfer notifications for change form ${newForm._id}`);
                        }
                        else if (input.club) {
                            await this.notificationService.createNotification({
                                title: "New Musher Registration",
                                message: `New ${input.formType} form submitted by ${input.applicantName || `${input.firstName} ${input.surname}`}`,
                                type: "MUSHER_SUBMISSION",
                                userId: input.club,
                                eventId: newForm._id.toString(),
                            });
                            logger_1.logger.info(`FormService: Created notification for club ${input.club}`);
                        }
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
            if (status) {
                query.status = status;
            }
            if (formType === "change") {
                query.formType = "change";
                if (clubId) {
                    query.$or = [{ affiliationFrom: clubId }, { affiliationTo: clubId }];
                }
            }
            else if (formType) {
                query.formType = formType;
                if (clubId) {
                    query.club = clubId;
                }
            }
            else if (clubId) {
                query.club = clubId;
                query.formType = { $in: ["new", "renewal"] };
            }
            const forms = await form_schema_1.FormModel.find(query).lean();
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
    async requestMusherTransfer(musherId, destinationClubId, user) {
        if (user.role !== "ADMIN" && user.role !== "CLUB") {
            throw new apollo_server_1.ApolloError("Unauthorized: Only club admins can request transfers");
        }
        const MusherModel = (0, typegoose_1.getModelForClass)(musher_schema_1.Musher);
        const musher = await MusherModel.findById(musherId);
        if (!musher) {
            throw new apollo_server_1.ApolloError("Musher not found");
        }
        const sourceClubId = musher.club?.toString();
        if (user.role === "CLUB" && sourceClubId !== userClubId(user)) {
            throw new apollo_server_1.ApolloError("Unauthorized: You can only transfer mushers from your own club");
        }
        if (!destinationClubId) {
            throw new apollo_server_1.ApolloError("Destination club is required");
        }
        if (destinationClubId === sourceClubId) {
            throw new apollo_server_1.ApolloError("Cannot transfer a musher to the same club");
        }
        const existingPending = await form_schema_1.FormModel.findOne({
            formType: "change",
            status: "pending",
            musherId,
        });
        if (existingPending) {
            throw new apollo_server_1.ApolloError("A transfer is already pending for this musher");
        }
        const nameParts = (musher.name || "").trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const surname = nameParts.slice(1).join(" ");
        const newForm = await form_schema_1.FormModel.create({
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
        }
        catch (notifError) {
            logger_1.logger.error(`Failed to notify destination club of transfer: ${notifError instanceof Error ? notifError.message : "Unknown error"}`);
        }
        logger_1.logger.info(`Club transfer requested for musher ${musherId}: ${sourceClubId} → ${destinationClubId}`);
        return newForm;
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
            if (form.formType === "change") {
                return await this.handleChangeFormStatus(form, status, user);
            }
            if (user.role === "CLUB" && form.club !== userClubId(user)) {
                throw new apollo_server_1.ApolloError("Unauthorized: You can only update forms for your own club");
            }
            form.status = status;
            if (status === "approved") {
                await this.applyApprovedMusherForm(form);
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
    async handleChangeFormStatus(form, status, user) {
        if (!userCanActOnChangeForm(form, user)) {
            throw new apollo_server_1.ApolloError("Unauthorized: You are not involved in this transfer");
        }
        const side = approvalSideForUser(form, user);
        if (!side) {
            throw new apollo_server_1.ApolloError("Unauthorized: You cannot act on this transfer");
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
    async findMusherForChangeForm(form) {
        const MusherModel = (0, typegoose_1.getModelForClass)(musher_schema_1.Musher);
        if (form.musherId) {
            const byId = await MusherModel.findById(form.musherId);
            if (byId)
                return byId;
        }
        if (form.nzfssRegistrationNumber) {
            const byReg = await MusherModel.findOne({ registrationNo: form.nzfssRegistrationNumber });
            if (byReg)
                return byReg;
        }
        if (form.firstName && form.surname) {
            const searchName = `${form.firstName} ${form.surname}`.trim();
            const byName = await MusherModel.findOne({
                name: { $regex: new RegExp(`^${searchName}$`, "i") },
            });
            if (byName)
                return byName;
        }
        if (form.applicantName) {
            const byApplicant = await MusherModel.findOne({
                name: { $regex: new RegExp(`^${form.applicantName.trim()}$`, "i") },
            });
            if (byApplicant)
                return byApplicant;
        }
        return null;
    }
    async executeMusherTransfer(form) {
        const MusherModel = (0, typegoose_1.getModelForClass)(musher_schema_1.Musher);
        const existingMusher = await this.findMusherForChangeForm(form);
        if (!existingMusher) {
            throw new apollo_server_1.ApolloError("Musher not found for transfer");
        }
        if (!form.affiliationTo) {
            throw new apollo_server_1.ApolloError("Destination club is required for transfer");
        }
        const oldClubId = existingMusher.club?.toString();
        const isClubInitiated = !!form.musherId;
        const constructedName = `${form.firstName || ""} ${form.surname || ""}`.trim();
        if (constructedName && !isClubInitiated) {
            existingMusher.name = constructedName;
        }
        else if (form.applicantName?.trim() && !isClubInitiated) {
            existingMusher.name = form.applicantName.trim();
        }
        if (!isClubInitiated) {
            if (form.address)
                existingMusher.address = form.address;
            if (form.phone)
                existingMusher.phone = form.phone;
            if (form.email)
                existingMusher.email = form.email;
            if (form.dateOfBirth)
                existingMusher.dateOfBirth = form.dateOfBirth;
            if (form.guardianDetails)
                existingMusher.guardianDetails = form.guardianDetails;
            if (form.showProfileConsent !== undefined && form.showProfileConsent !== null) {
                existingMusher.showProfileConsent = form.showProfileConsent;
            }
        }
        existingMusher.registrationNo =
            form.nzfssRegistrationNumber || existingMusher.registrationNo;
        existingMusher.club = form.affiliationTo;
        if (!isClubInitiated && form.dogs && form.dogs.length > 0) {
            const formDogInputs = form.dogs.map(mapFormDogToMusherInput);
            const existingDogs = (0, process_musher_dogs_1.ensureDogIdsOnStoredDogs)(existingMusher.dogs || []);
            const lookup = (0, dog_id_1.buildDogLookup)(existingDogs);
            const uniqueNewInputs = formDogInputs.filter((dog) => !(0, dog_id_1.findExistingDog)(dog, lookup));
            const uniqueNewDogs = (0, process_musher_dogs_1.processDogsForCreate)(uniqueNewInputs);
            existingMusher.dogs = [...existingDogs, ...uniqueNewDogs];
        }
        await existingMusher.save();
        logger_1.logger.info(`Transferred musher ${existingMusher._id} from ${oldClubId} to ${form.affiliationTo}`);
    }
    async notifyPartialTransferApproval(form, user) {
        const side = approvalSideForUser(form, user);
        const musherLabel = form.applicantName || `${form.firstName || ""} ${form.surname || ""}`.trim();
        const otherClubId = side === "from" ? form.affiliationTo : side === "to" ? form.affiliationFrom : undefined;
        if (!otherClubId)
            return;
        try {
            await this.notificationService.createNotification({
                title: "Transfer Awaiting Your Approval",
                message: `${musherLabel} transfer: one club has approved. Your approval is still required.`,
                type: "MUSHER_TRANSFER",
                userId: otherClubId,
                eventId: form._id.toString(),
            });
        }
        catch (err) {
            logger_1.logger.error(`Failed partial transfer notification: ${err instanceof Error ? err.message : "Unknown"}`);
        }
    }
    async notifyTransferDeclined(form, user) {
        const musherLabel = form.applicantName || `${form.firstName || ""} ${form.surname || ""}`.trim();
        const actorClubId = userClubId(user);
        const notifyIds = new Set();
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
            }
            catch (err) {
                logger_1.logger.error(`Failed decline notification: ${err instanceof Error ? err.message : "Unknown"}`);
            }
        }
    }
    async notifyTransferCompleted(form) {
        const musherLabel = form.applicantName || `${form.firstName || ""} ${form.surname || ""}`.trim();
        const notifyIds = new Set();
        if (form.affiliationFrom)
            notifyIds.add(form.affiliationFrom);
        if (form.affiliationTo)
            notifyIds.add(form.affiliationTo);
        for (const clubUserId of notifyIds) {
            try {
                await this.notificationService.createNotification({
                    title: "Musher Transfer Complete",
                    message: `${musherLabel} has been transferred between clubs. NZFSS registration numbers are unchanged.`,
                    type: "MUSHER_TRANSFER",
                    userId: clubUserId,
                    eventId: form._id.toString(),
                });
            }
            catch (err) {
                logger_1.logger.error(`Failed completion notification: ${err instanceof Error ? err.message : "Unknown"}`);
            }
        }
    }
    async applyApprovedMusherForm(form) {
        try {
            const MusherModel = (0, typegoose_1.getModelForClass)(musher_schema_1.Musher);
            if (form.formType === "new") {
                const musherName = `${form.firstName} ${form.surname}`.trim();
                const newDogs = (0, process_musher_dogs_1.processDogsForCreate)((form.dogs || []).map(mapFormDogToMusherInput));
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
                    logger_1.logger.info(`Updated existing musher record for approved new form: ${existingMusher._id}`);
                }
                else {
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
                    logger_1.logger.info(`Created new musher record for approved form: ${newMusher._id}`);
                }
            }
            else if (form.formType === "renewal") {
                const existingMusher = await this.findMusherForChangeForm(form);
                if (existingMusher) {
                    const constructedName = `${form.firstName || ""} ${form.surname || ""}`.trim();
                    if (constructedName) {
                        existingMusher.name = constructedName;
                    }
                    else if (form.applicantName?.trim()) {
                        existingMusher.name = form.applicantName.trim();
                    }
                    existingMusher.registrationNo =
                        form.nzfssRegistrationNumber || existingMusher.registrationNo;
                    if (form.address)
                        existingMusher.address = form.address;
                    if (form.phone)
                        existingMusher.phone = form.phone;
                    if (form.email)
                        existingMusher.email = form.email;
                    if (form.dateOfBirth)
                        existingMusher.dateOfBirth = form.dateOfBirth;
                    if (form.guardianDetails)
                        existingMusher.guardianDetails = form.guardianDetails;
                    if (form.showProfileConsent !== undefined && form.showProfileConsent !== null) {
                        existingMusher.showProfileConsent = form.showProfileConsent;
                    }
                    existingMusher.club = form.club || existingMusher.club;
                    if (form.dogs && form.dogs.length > 0) {
                        const formDogInputs = form.dogs.map(mapFormDogToMusherInput);
                        const existingDogs = (0, process_musher_dogs_1.ensureDogIdsOnStoredDogs)(existingMusher.dogs || []);
                        const hasRealDogs = formDogInputs.some((dog) => dog.name?.trim());
                        if (hasRealDogs) {
                            existingMusher.dogs = (0, process_musher_dogs_1.processDogsForUpdate)(formDogInputs, existingDogs);
                        }
                        else {
                            existingMusher.dogs = existingDogs;
                        }
                    }
                    await existingMusher.save();
                    logger_1.logger.info(`Updated existing musher record: ${existingMusher._id} for renewal form`);
                }
                else {
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
                        dogs: (0, process_musher_dogs_1.processDogsForCreate)((form.dogs || []).map(mapFormDogToMusherInput)),
                    });
                    logger_1.logger.info(`No existing musher found for renewal form, created: ${newMusher._id}`);
                }
            }
        }
        catch (error) {
            logger_1.logger.error(`Error handling musher record for ${form.formType} form: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
exports.FormService = FormService;
//# sourceMappingURL=form.service.js.map