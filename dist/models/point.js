"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Point = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const pointSchema = new mongoose_1.default.Schema({
    entrantId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Entrant",
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    cutoffTime: {
        type: String,
        required: false
    },
    dogPoints: [{
            NZFSSRegistration: {
                type: String,
                required: true
            },
            points: {
                type: Number,
                required: true
            }
        }],
    heatsData: [{
            heat: String,
            temperature: String,
            distance: String,
            class: String
        }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
pointSchema.virtual('entrant', {
    ref: 'Entrant',
    localField: 'entrantId',
    foreignField: '_id',
    justOne: true
});
pointSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});
exports.Point = mongoose_1.default.model("Point", pointSchema);
//# sourceMappingURL=point.js.map