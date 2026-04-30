"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const lodash_1 = require("lodash");
const graphql_1 = require("graphql");
const mongoose_1 = require("mongoose");
const rootTypeDefs = (0, apollo_server_express_1.gql) `
  type Query {
    _: Boolean
  }
  
  type Mutation {
    _: Boolean
  }

  # Base scalar types
  scalar Date
  scalar ObjectId
`;
const dateScalar = new graphql_1.GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    serialize(outputValue) {
        if (outputValue instanceof Date) {
            return outputValue.toISOString();
        }
        return null;
    },
    parseValue(inputValue) {
        if (typeof inputValue === "string" || typeof inputValue === "number" || inputValue instanceof Date) {
            return new Date(inputValue);
        }
        return null;
    },
    parseLiteral(ast) {
        return ast.kind === "StringValue" ? new Date(ast.value) : null;
    }
});
const objectIdScalar = new graphql_1.GraphQLScalarType({
    name: "ObjectId",
    description: "MongoDB ObjectId scalar type",
    serialize(outputValue) {
        if (outputValue instanceof mongoose_1.Types.ObjectId) {
            return outputValue.toString();
        }
        return String(outputValue);
    },
    parseValue(inputValue) {
        if (typeof inputValue === "string") {
            return new mongoose_1.Types.ObjectId(inputValue);
        }
        return null;
    },
    parseLiteral(ast) {
        return ast.kind === "StringValue" ? new mongoose_1.Types.ObjectId(ast.value) : null;
    }
});
exports.typeDefs = [rootTypeDefs];
exports.resolvers = (0, lodash_1.merge)({}, {
    Date: dateScalar,
    ObjectId: objectIdScalar
});
//# sourceMappingURL=schema.js.map