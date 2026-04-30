export declare class RcrPoints {
    _id: string;
    rcrFlag?: string;
    rcrReg?: string;
    rcrPedigreeName?: string;
    rcrBreed?: string;
    rcrPoints?: number;
    rcrEvents?: number;
    rcrAwards?: string;
    rcrCutoff?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const RcrPointsModel: import("@typegoose/typegoose").ReturnModelType<typeof RcrPoints, import("@typegoose/typegoose/lib/types").BeAnObject>;
