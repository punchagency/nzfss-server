"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authChecker = ({ context, info }) => {
    const publicQueries = [
        'findSingleClubById',
        'getAllClubManagements',
        'getAllContacts',
        'getAllClubs',
        'findEventCalendarById',
        'getAllPoints',
        'getPointsByEventId',
        'getEntrantsByEventId',
        'getEventsWithResults'
    ];
    if (publicQueries.includes(info.fieldName)) {
        return true;
    }
    return !!context.user;
};
exports.default = authChecker;
//# sourceMappingURL=authChecker.js.map