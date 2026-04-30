import { RcrPoints } from "../schema/rcrpoints.schema";
export declare class RcrPointsResolver {
    getAllRcrPoints(): Promise<RcrPoints[]>;
    getRcrPointsByFlag(flag: string): Promise<RcrPoints[]>;
}
