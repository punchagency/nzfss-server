import { AuthChecker } from "type-graphql";
import Context from "../types/context";

const authChecker: AuthChecker<Context> = ({ context, info }) => {
    // Allow unauthenticated access to specific queries
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
    
    // For all other queries/msutations, require authentications
    return !!context.user;
}

export default authChecker