import { Entrants } from "./entrants.schema";
import { HeatData } from './heat.schema';
export declare class DogPoint {
    NZFSSRegistration: string;
    points: number;
}
export declare class Point {
    _id: string;
    entrantId: string;
    points: number;
    cutoffTime?: string;
    dogPoints?: DogPoint[];
    heatsData?: HeatData[];
    createdAt: Date;
    updatedAt: Date;
    entrant?: Entrants;
}
export declare const PointModel: import("@typegoose/typegoose").ReturnModelType<typeof Point, import("@typegoose/typegoose/lib/types").BeAnObject>;
export declare class DogPointInput {
    NZFSSRegistration: string;
    points: number;
}
export declare class PointsInput {
    entrantId: string;
    points: number;
    cutoffTime?: string;
    dogPoints: DogPointInput[];
    heatsData?: HeatData[];
}
export declare class SubmitPointsResponse {
    success: boolean;
    message?: string;
    points?: Point[];
}
