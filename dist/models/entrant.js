"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entrant = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const entrantSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    raceFormat: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    customClass: String,
    associatedDog: [{
            driverName: String,
            name: String,
            NZFSSRegistration: String,
            dob: String,
            breed: String
        }],
    raceType: {
        type: String,
        enum: ["musher", "harness", "weightpull", "started"],
        required: true
    },
    startTime: String,
    raceTime: String,
    cutoffTime: String,
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    eventId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    temperature: String,
    distance: String,
    heat: String,
    heatsData: [{
            heat: String,
            temperature: String,
            distance: String,
            class: String
        }],
    dogWeight: String,
    weightPulled: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});
exports.Entrant = mongoose_1.default.model("Entrant", entrantSchema);
//# sourceMappingURL=entrant.js.map