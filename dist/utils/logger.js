"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importStar(require("winston"));
const util = __importStar(require("util"));
const { printf } = winston_1.format;
const logFormat = printf((info) => {
    let logMessage = `${info.level}:`;
    if (info.message) {
        if (typeof info.message === 'object') {
            logMessage += ` ${util.inspect(info.message, { depth: null, colors: true })}`;
        }
        else {
            logMessage += ` ${info.message}`;
        }
    }
    const splat = info[Symbol.for('splat')];
    if (Array.isArray(splat)) {
        splat.forEach((item) => {
            if (typeof item === 'object' && item !== null) {
                logMessage += ` ${util.inspect(item, { depth: null, colors: true })}`;
            }
            else {
                logMessage += ` ${String(item)}`;
            }
        });
    }
    return logMessage;
});
const customLevels = {
    payload: 0,
    authorized: 1,
    downloading: 2,
    uploading: 3,
    tokenType: 4,
    warn: 5,
    error: 6,
    info: 7,
};
const colorScheme = {
    info: 'cyan',
    error: 'red',
    warn: 'yellow',
    payload: 'blue',
    authorized: 'green',
    downloading: 'magenta',
    uploading: 'cyan',
    tokenType: 'yellow',
};
const logger = winston_1.default.createLogger({
    levels: customLevels,
    transports: [
        new winston_1.default.transports.Console({
            level: 'info',
            format: winston_1.default.format.combine(winston_1.default.format.colorize({
                colors: colorScheme,
            }), winston_1.default.format.simple(), logFormat),
        }),
    ],
    format: winston_1.format.combine(winston_1.format.json(), winston_1.format.prettyPrint()),
});
exports.logger = logger;
//# sourceMappingURL=logger.js.map