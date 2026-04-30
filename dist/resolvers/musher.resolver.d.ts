import { Context } from "../types/context";
import { Musher, CreateMusherInput, UpdateMusherInput } from "../schema/musher.schema";
export default class MusherResolver {
    private transformMusherDocument;
    createMusher(input: CreateMusherInput, context: Context): Promise<Musher>;
    getMushers(context: Context, clubId?: string): Promise<Musher[]>;
    getClubMushers(context: Context, clubId?: string): Promise<Musher[]>;
    updateMusher(id: string, input: UpdateMusherInput, context: Context): Promise<Musher>;
    deleteMusher(id: string, context: Context): Promise<boolean>;
    checkDuplicateMusher(context: Context, surname?: string, nzfssRegistrationNumber?: string): Promise<Musher[]>;
    getMushersForEvent(context: Context, eventId: string): Promise<Musher[]>;
}
