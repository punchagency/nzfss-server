import { gql } from "apollo-server-express";
import { merge } from "lodash";
import { GraphQLScalarType, ValueNode } from "graphql";
import { Types } from "mongoose";

const rootTypeDefs = gql`
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

// Custom scalar resolverss
const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(outputValue: unknown): string | null {
    if (outputValue instanceof Date) {
      return outputValue.toISOString();
    }
    return null;
  },
  parseValue(inputValue: unknown): Date | null {
    if (typeof inputValue === "string" || typeof inputValue === "number" || inputValue instanceof Date) {
      return new Date(inputValue);
    }
    return null;
  },
  parseLiteral(ast: ValueNode): Date | null {
    return ast.kind === "StringValue" ? new Date(ast.value) : null;
  }
});

const objectIdScalar = new GraphQLScalarType({
  name: "ObjectId",
  description: "MongoDB ObjectId scalar type",
  serialize(outputValue: unknown): string {
    if (outputValue instanceof Types.ObjectId) {
      return outputValue.toString();
    }
    return String(outputValue);
  },
  parseValue(inputValue: unknown): Types.ObjectId | null {
    if (typeof inputValue === "string") {
      return new Types.ObjectId(inputValue);
    }
    return null;
  },
  parseLiteral(ast: ValueNode): Types.ObjectId | null {
    return ast.kind === "StringValue" ? new Types.ObjectId(ast.value) : null;
  }
});

// Combine all type definitions
export const typeDefs = [rootTypeDefs];

// Combine all resolvers
export const resolvers = merge(
  {},
  {
    Date: dateScalar,
    ObjectId: objectIdScalar
  }
); 