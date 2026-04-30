import mongoose from "mongoose";
export declare const ContactModel: mongoose.Model<any, {}, {}, {}, any, any> | mongoose.Model<{
    email: string;
    name: string;
    club: mongoose.Types.ObjectId;
    created_at: string;
    designation: string;
    image?: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    email: string;
    name: string;
    club: mongoose.Types.ObjectId;
    created_at: string;
    designation: string;
    image?: string;
}, {}> & {
    email: string;
    name: string;
    club: mongoose.Types.ObjectId;
    created_at: string;
    designation: string;
    image?: string;
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
    email: string;
    name: string;
    club: mongoose.Types.ObjectId;
    created_at: string;
    designation: string;
    image?: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    email: string;
    name: string;
    club: mongoose.Types.ObjectId;
    created_at: string;
    designation: string;
    image?: string;
}>, {}> & mongoose.FlatRecord<{
    email: string;
    name: string;
    club: mongoose.Types.ObjectId;
    created_at: string;
    designation: string;
    image?: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
