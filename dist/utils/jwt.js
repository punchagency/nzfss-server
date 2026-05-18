"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Secretkey = process.env.PUBLIC_KEY;
function signJwt(payload) {
    if (!Secretkey) {
        throw new Error('JWT Secret key (PUBLIC_KEY) is not set in environment variables');
    }
    return jsonwebtoken_1.default.sign(payload, Secretkey, {
        expiresIn: '180m',
    });
}
function verifyJwt(token) {
    try {
        if (!Secretkey) {
            console.error('JWT Secret key (PUBLIC_KEY) is not set in environment variables');
            return null;
        }
        if (!token) {
            console.warn('No token provided to verifyJwt');
            return null;
        }
        const decoded = jsonwebtoken_1.default.verify(token, Secretkey);
        return decoded;
    }
    catch (e) {
        console.error('JWT verification failed:', {
            error: e instanceof Error ? e.message : e,
            tokenLength: token?.length || 0,
            hasSecretKey: !!Secretkey
        });
        return null;
    }
}
//# sourceMappingURL=jwt.js.map