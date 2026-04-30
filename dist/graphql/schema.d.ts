import { GraphQLScalarType } from "graphql";
import { Types } from "mongoose";
export declare const typeDefs: import("graphql").DocumentNode[];
export declare const resolvers: {
    Date: GraphQLScalarType<Date, string>;
    ObjectId: GraphQLScalarType<Types.ObjectId, string>;
};
