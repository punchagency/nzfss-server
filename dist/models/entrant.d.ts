import mongoose from "mongoose";
export declare const Entrant: mongoose.Model<{
    createdAt: NativeDate;
    name: string;
    userId: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    class: string;
    raceFormat: string;
    associatedDog: mongoose.Types.DocumentArray<{
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }> & {
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }>;
    raceType: "musher" | "harness" | "weightpull" | "started";
    heatsData: mongoose.Types.DocumentArray<{
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }> & {
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }>;
    heat?: string;
    temperature?: string;
    distance?: string;
    customClass?: string;
    startTime?: string;
    raceTime?: string;
    cutoffTime?: string;
    dogWeight?: string;
    weightPulled?: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    name: string;
    userId: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    class: string;
    raceFormat: string;
    associatedDog: mongoose.Types.DocumentArray<{
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }> & {
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }>;
    raceType: "musher" | "harness" | "weightpull" | "started";
    heatsData: mongoose.Types.DocumentArray<{
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }> & {
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }>;
    heat?: string;
    temperature?: string;
    distance?: string;
    customClass?: string;
    startTime?: string;
    raceTime?: string;
    cutoffTime?: string;
    dogWeight?: string;
    weightPulled?: string;
}, {}> & {
    createdAt: NativeDate;
    name: string;
    userId: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    class: string;
    raceFormat: string;
    associatedDog: mongoose.Types.DocumentArray<{
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }> & {
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }>;
    raceType: "musher" | "harness" | "weightpull" | "started";
    heatsData: mongoose.Types.DocumentArray<{
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }> & {
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }>;
    heat?: string;
    temperature?: string;
    distance?: string;
    customClass?: string;
    startTime?: string;
    raceTime?: string;
    cutoffTime?: string;
    dogWeight?: string;
    weightPulled?: string;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    createdAt: NativeDate;
    name: string;
    userId: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    class: string;
    raceFormat: string;
    associatedDog: mongoose.Types.DocumentArray<{
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }> & {
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }>;
    raceType: "musher" | "harness" | "weightpull" | "started";
    heatsData: mongoose.Types.DocumentArray<{
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }> & {
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }>;
    heat?: string;
    temperature?: string;
    distance?: string;
    customClass?: string;
    startTime?: string;
    raceTime?: string;
    cutoffTime?: string;
    dogWeight?: string;
    weightPulled?: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    name: string;
    userId: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    class: string;
    raceFormat: string;
    associatedDog: mongoose.Types.DocumentArray<{
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }> & {
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }>;
    raceType: "musher" | "harness" | "weightpull" | "started";
    heatsData: mongoose.Types.DocumentArray<{
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }> & {
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }>;
    heat?: string;
    temperature?: string;
    distance?: string;
    customClass?: string;
    startTime?: string;
    raceTime?: string;
    cutoffTime?: string;
    dogWeight?: string;
    weightPulled?: string;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    name: string;
    userId: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    class: string;
    raceFormat: string;
    associatedDog: mongoose.Types.DocumentArray<{
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }> & {
        name?: string;
        dob?: string;
        breed?: string;
        driverName?: string;
        NZFSSRegistration?: string;
    }>;
    raceType: "musher" | "harness" | "weightpull" | "started";
    heatsData: mongoose.Types.DocumentArray<{
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }> & {
        heat?: string;
        temperature?: string;
        distance?: string;
        class?: string;
    }>;
    heat?: string;
    temperature?: string;
    distance?: string;
    customClass?: string;
    startTime?: string;
    raceTime?: string;
    cutoffTime?: string;
    dogWeight?: string;
    weightPulled?: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
