import CalendarResolver from "./calendar.resolver";
import ClubResolver from "./club.resolver";
import FormResolver from "./form.resolver";
import RulesResolver from "./rules.resolver";
import UserResolver from "./user.resolver";
import YearbookResolver from "./yearbook.resolver";
import DogsResolver from "./dogs.resolver";
import LogsResolver from "./logs.resolver";
import EntrantResolver from "./entrant.resolver";
import ContactResolver from "./contact.resolver";
import MusherResolver from "./musher.resolver";
import ClubManagementResolver from "./club-management.resolver";
import { PointResolver } from "./point.resolver";
import { NotificationResolver } from "../schema/notification.schema";
import { WprPointsResolver } from "./wprpoints.resolver";
import { RcrPointsResolver } from "./rcrpoints.resolver";

export const resolvers = [
    UserResolver, 
    ClubResolver,
    YearbookResolver,
    FormResolver,
    RulesResolver,
    CalendarResolver,
    LogsResolver,
    EntrantResolver,
    DogsResolver,
    ContactResolver,
    MusherResolver,
    ClubManagementResolver,
    PointResolver,
    NotificationResolver,
    WprPointsResolver,
    RcrPointsResolver
] as const 