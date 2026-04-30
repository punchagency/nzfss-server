import { Resolver, Query, Arg } from "type-graphql";
import { WprPoints, WprPointsModel } from "../schema/wprpoints.schema";

@Resolver()
export class WprPointsResolver {
    @Query(() => [WprPoints])
    async getAllWprPoints(): Promise<WprPoints[]> {
        try {
            const wprPoints = await WprPointsModel.find({}).lean();
            
            return wprPoints.map(point => ({
                _id: point._id.toString(),
                wprFlag: point.wprFlag || null,
                wprReg: point.wprReg || null,
                wprPedigreeName: point.wprPedigreeName || null,
                wprBreed: point.wprBreed || null,
                wprMaxWeight: point.wprMaxWeight || null,
                wprMaxBWR: point.wprMaxBWR || null,
                wprPoints: point.wprPoints || null,
                wprAwards: point.wprAwards || null,
                createdAt: point.createdAt || new Date(),
                updatedAt: point.updatedAt || new Date()
            }));
        } catch (error) {
            console.error("Error fetching WPR points:", error);
            throw new Error("Failed to fetch WPR points");
        }
    }

    @Query(() => WprPoints, { nullable: true })
    async getWprPointsByFlag(@Arg("wprFlag") wprFlag: string): Promise<WprPoints | null> {
        try {
            const wprPoint = await WprPointsModel.findOne({ wprFlag }).lean();
            
            if (!wprPoint) return null;
            
            return {
                _id: wprPoint._id.toString(),
                wprFlag: wprPoint.wprFlag || null,
                wprReg: wprPoint.wprReg || null,
                wprPedigreeName: wprPoint.wprPedigreeName || null,
                wprBreed: wprPoint.wprBreed || null,
                wprMaxWeight: wprPoint.wprMaxWeight || null,
                wprMaxBWR: wprPoint.wprMaxBWR || null,
                wprPoints: wprPoint.wprPoints || null,
                wprAwards: wprPoint.wprAwards || null,
                createdAt: wprPoint.createdAt || new Date(),
                updatedAt: wprPoint.updatedAt || new Date()
            };
        } catch (error) {
            console.error("Error fetching WPR point by flag:", error);
            throw new Error("Failed to fetch WPR point");
        }
    }
} 