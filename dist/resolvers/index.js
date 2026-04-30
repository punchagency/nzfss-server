"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const calendar_resolver_1 = __importDefault(require("./calendar.resolver"));
const club_resolver_1 = __importDefault(require("./club.resolver"));
const form_resolver_1 = __importDefault(require("./form.resolver"));
const rules_resolver_1 = __importDefault(require("./rules.resolver"));
const user_resolver_1 = __importDefault(require("./user.resolver"));
const yearbook_resolver_1 = __importDefault(require("./yearbook.resolver"));
const dogs_resolver_1 = __importDefault(require("./dogs.resolver"));
const logs_resolver_1 = __importDefault(require("./logs.resolver"));
const entrant_resolver_1 = __importDefault(require("./entrant.resolver"));
const contact_resolver_1 = __importDefault(require("./contact.resolver"));
const musher_resolver_1 = __importDefault(require("./musher.resolver"));
const club_management_resolver_1 = __importDefault(require("./club-management.resolver"));
const point_resolver_1 = require("./point.resolver");
const notification_schema_1 = require("../schema/notification.schema");
const wprpoints_resolver_1 = require("./wprpoints.resolver");
const rcrpoints_resolver_1 = require("./rcrpoints.resolver");
exports.resolvers = [
    user_resolver_1.default,
    club_resolver_1.default,
    yearbook_resolver_1.default,
    form_resolver_1.default,
    rules_resolver_1.default,
    calendar_resolver_1.default,
    logs_resolver_1.default,
    entrant_resolver_1.default,
    dogs_resolver_1.default,
    contact_resolver_1.default,
    musher_resolver_1.default,
    club_management_resolver_1.default,
    point_resolver_1.PointResolver,
    notification_schema_1.NotificationResolver,
    wprpoints_resolver_1.WprPointsResolver,
    rcrpoints_resolver_1.RcrPointsResolver
];
//# sourceMappingURL=index.js.map