import mongoose from "mongoose";
export declare function connectToMongo(retryCount?: number, connectionIndex?: number, connectionUris?: string[]): Promise<typeof mongoose>;
