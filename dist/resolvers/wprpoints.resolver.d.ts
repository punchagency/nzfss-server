import { WprPoints } from "../schema/wprpoints.schema";
export declare class WprPointsResolver {
    getAllWprPoints(): Promise<WprPoints[]>;
    getWprPointsByFlag(wprFlag: string): Promise<WprPoints | null>;
}
