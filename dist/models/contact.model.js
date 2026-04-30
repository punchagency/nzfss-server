"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const contactSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    designation: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String },
    created_at: { type: String, required: true },
    club: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Club", required: true }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
contactSchema.virtual("clubDetails", {
    ref: "Club",
    localField: "club",
    foreignField: "_id",
    justOne: true
});
contactSchema.index({ club: 1 });
exports.ContactModel = mongoose_1.default.models.Contact || mongoose_1.default.model("Contact", contactSchema);
//# sourceMappingURL=contact.model.js.map