export declare class WprPoints {
    _id: string;
    wprFlag?: string;
    wprReg?: string;
    wprPedigreeName?: string;
    wprBreed?: string;
    wprMaxWeight?: number;
    wprMaxBWR?: number;
    wprPoints?: number;
    wprAwards?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WprPointsModel: import("@typegoose/typegoose").ReturnModelType<typeof WprPoints, import("@typegoose/typegoose/lib/types").BeAnObject>;
