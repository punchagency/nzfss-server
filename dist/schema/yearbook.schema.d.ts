export declare class Yearbook {
    _id: string;
    yearbook: string;
    yearbookName: string;
    yearPublish: string;
}
export declare const YearbookModel: import("@typegoose/typegoose").ReturnModelType<typeof Yearbook, import("@typegoose/typegoose/lib/types").BeAnObject>;
export declare class CreateYearbookInput {
    yearbook: string;
    yearbookName: string;
    yearPublish: string;
}
export declare class UpdateYearbookInput {
    yearbook?: string;
    yearbookName?: string;
    yearPublish?: string;
}
export declare class FindYearbookByIdInput {
    _id: string;
}
