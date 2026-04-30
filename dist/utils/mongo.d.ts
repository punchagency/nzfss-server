import mongoose from "mongoose";
export declare function connectToMongo(retryCount?: number): Promise<typeof mongoose>;
