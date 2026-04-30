export interface JwtPayload {
    _id: string;
    email: string;
    name: string;
    role: string;
    club?: {
        _id: string;
        name: string;
    };
}
export declare function signJwt(payload: JwtPayload): string;
export declare function verifyJwt<T>(token: string): T | null;
