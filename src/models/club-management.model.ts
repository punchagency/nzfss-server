import { getModelForClass } from "@typegoose/typegoose";
import { ClubManagement } from "../schema/club-management.schema";

export const ClubManagementModel = getModelForClass(ClubManagement); 