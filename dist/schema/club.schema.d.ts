export declare class Club {
    _id: string;
    clubName: string;
    email: string;
    password: string;
    createdAt: Date;
}
export declare const ClubModel: import("@typegoose/typegoose").ReturnModelType<typeof Club, import("@typegoose/typegoose/lib/types").BeAnObject>;
export declare class CreateClubInput {
    clubName: string;
    email: string;
    password: string;
}
export declare class UpdateClubInput {
    clubName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}
export declare class FindClubByIdInput {
    _id: string;
}
