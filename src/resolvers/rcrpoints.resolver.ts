import { Query, Resolver, Arg } from "type-graphql";
import { RcrPoints, RcrPointsModel } from "../schema/rcrpoints.schema";

@Resolver()
export class RcrPointsResolver {
    @Query(() => [RcrPoints])
    async getAllRcrPoints(): Promise<RcrPoints[]> {
        try {
            console.log("Fetching RCR points...");
            const rcrPoints = await RcrPointsModel.find({})
                .lean()
                .maxTimeMS(10000); // 10 second timeout
            console.log(`Found ${rcrPoints.length} RCR points`);
            return rcrPoints.map(point => ({
                _id: point._id.toString(),
                rcrFlag: point.rcrFlag || null,
                rcrReg: point.rcrReg || null,
                rcrPedigreeName: point.rcrPedigreeName || null,
                rcrBreed: point.rcrBreed || null,
                rcrPoints: point.rcrPoints || null,
                rcrEvents: point.rcrEvents || null,
                rcrAwards: point.rcrAwards || null,
                rcrCutoff: point.rcrCutoff || null,
                createdAt: point.createdAt || new Date(),
                updatedAt: point.updatedAt || new Date()
            }));
        } catch (error) {
            console.error("Error fetching RCR points:", error);
            // Return empty array instead of throwing error to prevent page crashes
            return [];
        }
    }

    @Query(() => [RcrPoints])
    async getRcrPointsByFlag(@Arg("flag") flag: string): Promise<RcrPoints[]> {
        try {
            const rcrPoints = await RcrPointsModel.find({ rcrFlag: flag }).lean();
            return rcrPoints.map(point => ({
                _id: point._id.toString(),
                rcrFlag: point.rcrFlag || null,
                rcrReg: point.rcrReg || null,
                rcrPedigreeName: point.rcrPedigreeName || null,
                rcrBreed: point.rcrBreed || null,
                rcrPoints: point.rcrPoints || null,
                rcrEvents: point.rcrEvents || null,
                rcrAwards: point.rcrAwards || null,
                rcrCutoff: point.rcrCutoff || null,
                createdAt: point.createdAt || new Date(),
                updatedAt: point.updatedAt || new Date()
            }));
        } catch (error) {
            console.error("Error fetching RCR points by flag:", error);
            throw new Error("Failed to fetch RCR points by flag");
        }
    }
} 