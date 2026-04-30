import { ClubManagement, CreateClubManagementInput, FindClubManagementByIdInput, UpdateClubManagementInput } from "../schema/club-management.schema";
import Context from "../types/context";
import { ClubManagementService } from "../service/club-management.service";
export default class ClubManagementResolver {
    private clubManagementService;
    constructor(clubManagementService: ClubManagementService);
    createClubManagement(context: Context, input: CreateClubManagementInput): Promise<ClubManagement>;
    getAllClubManagements(context: Context): Promise<ClubManagement[]>;
    findClubManagementById(input: FindClubManagementByIdInput, context: Context): Promise<ClubManagement>;
    updateClubManagement(context: Context, clubId: string, input: UpdateClubManagementInput): Promise<ClubManagement>;
    deleteClubManagement(context: Context, clubId: string): Promise<ClubManagement>;
    getClubManagement(userId: string, context: Context): Promise<ClubManagement[]>;
    getCurrentUserClubDetails(context: Context): Promise<ClubManagement>;
}
