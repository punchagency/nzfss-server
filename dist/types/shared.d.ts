export interface HeatDataInput {
    heat: string;
    temperature: string;
    distance: string;
    class: string;
}
export interface DogPointInput {
    NZFSSRegistration: string;
    points: number;
}
export interface PointInput {
    entrantId: string;
    points: number;
    cutoffTime?: string;
    dogPoints?: DogPointInput[];
    heatsData?: HeatDataInput[];
}
export interface Dog {
    driverName: string;
    name: string;
    NZFSSRegistration: string;
    dob: string;
    breed: string;
}
export interface Entrant {
    _id: string;
    name: string;
    raceFormat: string;
    class: string;
    customClass: string;
    associatedDog: Dog[];
    raceType: string;
    startTime: string;
    raceTime: string;
    cutoffTime?: string;
    userId: string;
    eventId: string;
    temperature: string;
    distance: string;
    createdAt: string;
    heatsData?: HeatDataInput[];
}
export interface Point {
    _id: string;
    entrantId: string;
    points: number;
    cutoffTime?: string;
    dogPoints?: DogPointInput[];
    heatsData?: HeatDataInput[];
    createdAt: string;
    updatedAt: string;
    entrant?: Entrant;
}
export interface SubmitPointsResponse {
    success: boolean;
    message?: string;
    points: Point[];
}
