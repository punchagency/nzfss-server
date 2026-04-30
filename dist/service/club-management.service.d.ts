import { ClubManagement, CreateClubManagementInput, UpdateClubManagementInput } from "../schema/club-management.schema";
import Context from "../types/context";
export declare class ClubManagementService {
    createClubManagement(input: CreateClubManagementInput, context: Context): Promise<ClubManagement>;
    getAllClubManagements(user: Context["user"]): Promise<ClubManagement[]>;
    getAllClubDetails(user: Context["user"]): Promise<ClubManagement[]>;
    findClubManagementById(clubId: string, user: Context["user"]): Promise<ClubManagement>;
    updateClubManagement(input: UpdateClubManagementInput, clubId: string, user: Context["user"]): Promise<ClubManagement>;
    deleteClubManagement(clubId: string, user: Context["user"]): Promise<ClubManagement>;
    private handleFileUploads;
}
