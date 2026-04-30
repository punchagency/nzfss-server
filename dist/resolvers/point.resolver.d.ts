import { Point, PointsInput, SubmitPointsResponse } from "../schema/point.schema";
export declare class PointResolver {
    getPoints(entrantId: string): Promise<Point | null>;
    getAllPoints(): Promise<Point[]>;
    getPointsByEventId(eventId: string): Promise<Point[]>;
    submitPoints(points: PointsInput[]): Promise<SubmitPointsResponse>;
    private convertHeatsData;
    private convertToEntrantsType;
    private cleanupDuplicateHeatsData;
}
