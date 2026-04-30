export declare class Rules {
    _id: string;
    constitutionRules: string;
    amendedDate: string;
    file: string;
    fileName: string;
    createdAt: Date;
}
export declare const RulesModel: import("@typegoose/typegoose").ReturnModelType<typeof Rules, import("@typegoose/typegoose/lib/types").BeAnObject>;
export declare class CreateRulesInput {
    constitutionRules: string;
    amendedDate: string;
    file: string;
    fileName?: string;
}
export declare class UpdateRulesInput {
    constitutionRules?: string;
    amendedDate?: string;
    file?: string;
    fileName?: string;
}
export declare class FindRulesByIdInput {
    _id: string;
}
