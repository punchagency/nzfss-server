"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const apollo_server_1 = require("apollo-server");
const isAuth = async ({ context }, next) => {
    const { user } = context;
    if (!user) {
        throw new apollo_server_1.ApolloError("Not authenticated");
    }
    return next();
};
exports.isAuth = isAuth;
//# sourceMappingURL=is-auth.js.map