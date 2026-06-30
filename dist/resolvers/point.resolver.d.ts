import { GraphQLResolveInfo } from "graphql";
import { Point, PointsInput, SubmitPointsResponse } from "../schema/point.schema";
export declare class PointResolver {
    private isFieldRequested;
    private formatPointRecord;
    getPoints(entrantId: string): Promise<Point | null>;
    getAllPoints(info: GraphQLResolveInfo): Promise<Point[]>;
    getPointsByEventId(eventId: string): Promise<Point[]>;
    submitPoints(points: PointsInput[]): Promise<SubmitPointsResponse>;
    private convertHeatsData;
    private convertToEntrantsType;
    private cleanupDuplicateHeatsData;
}
