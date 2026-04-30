import mongoose from "mongoose";
export declare const Point: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
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
    points: number;
    entrantId: mongoose.Types.ObjectId;
    dogPoints: mongoose.Types.DocumentArray<{
        NZFSSRegistration: string;
        points: number;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        NZFSSRegistration: string;
        points: number;
    }> & {
        NZFSSRegistration: string;
        points: number;
    }>;
    cutoffTime?: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
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
    points: number;
    entrantId: mongoose.Types.ObjectId;
    dogPoints: mongoose.Types.DocumentArray<{
        NZFSSRegistration: string;
        points: number;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        NZFSSRegistration: string;
        points: number;
    }> & {
        NZFSSRegistration: string;
        points: number;
    }>;
    cutoffTime?: string;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
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
    points: number;
    entrantId: mongoose.Types.ObjectId;
    dogPoints: mongoose.Types.DocumentArray<{
        NZFSSRegistration: string;
        points: number;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        NZFSSRegistration: string;
        points: number;
    }> & {
        NZFSSRegistration: string;
        points: number;
    }>;
    cutoffTime?: string;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    toJSON: {
        virtuals: true;
    };
    toObject: {
        virtuals: true;
    };
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
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
    points: number;
    entrantId: mongoose.Types.ObjectId;
    dogPoints: mongoose.Types.DocumentArray<{
        NZFSSRegistration: string;
        points: number;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        NZFSSRegistration: string;
        points: number;
    }> & {
        NZFSSRegistration: string;
        points: number;
    }>;
    cutoffTime?: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
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
    points: number;
    entrantId: mongoose.Types.ObjectId;
    dogPoints: mongoose.Types.DocumentArray<{
        NZFSSRegistration: string;
        points: number;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        NZFSSRegistration: string;
        points: number;
    }> & {
        NZFSSRegistration: string;
        points: number;
    }>;
    cutoffTime?: string;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
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
    points: number;
    entrantId: mongoose.Types.ObjectId;
    dogPoints: mongoose.Types.DocumentArray<{
        NZFSSRegistration: string;
        points: number;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        NZFSSRegistration: string;
        points: number;
    }> & {
        NZFSSRegistration: string;
        points: number;
    }>;
    cutoffTime?: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
