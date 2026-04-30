"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = void 0;
const zod_1 = __importDefault(require("zod"));
class Validate {
    static isValidPassword(password) {
        if (password === null || password === undefined) {
            return false;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$&*-^!])[a-zAZ\d@#$&*-^!]{6,}$/;
        return passwordRegex.test(password);
    }
    static isValidEmail(email) {
        const emailSchema = zod_1.default.string().email();
        return emailSchema.safeParse(email).success;
    }
}
exports.Validate = Validate;
//# sourceMappingURL=validateCheck.js.map