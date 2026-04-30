import { MiddlewareFn } from "type-graphql";
import { ApolloError } from "apollo-server";
import { Context } from "../types/context";

export const isAuth: MiddlewareFn<Context> = async ({ context }, next) => {
  const { user } = context;

  if (!user) {
    throw new ApolloError("Not authenticated");
  }

  return next();
}; 