"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubManagementModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const club_management_schema_1 = require("../schema/club-management.schema");
exports.ClubManagementModel = (0, typegoose_1.getModelForClass)(club_management_schema_1.ClubManagement);
//# sourceMappingURL=club-management.model.js.map