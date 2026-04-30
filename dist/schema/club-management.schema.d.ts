export declare class ClubStatistic {
    name?: string;
    icon?: string;
    isCustomIcon?: boolean;
}
export declare class WhoWeAreSection {
    description?: string;
    images?: string[];
}
export declare class Service {
    name?: string;
    image?: string;
}
export declare class Gallery {
    images?: string[];
    videos?: string[];
}
declare class Coordinates {
    lat?: number;
    lng?: number;
}
export declare class Location {
    description?: string;
    address?: string;
    image?: string;
    coordinates?: Coordinates;
}
export declare class Driver {
    name?: string;
    image?: string;
    nzfssRR?: string;
    ipssRR?: string;
}
export declare class ClubForm {
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    fileData?: string;
}
export declare class ClubManagement {
    clubName?: string;
    shortDescription?: string;
    clubLogo?: string;
    coverImage?: string;
    statistics?: ClubStatistic[];
    whoWeAre?: WhoWeAreSection[];
    services?: Service[];
    gallery?: Gallery;
    location?: Location;
    drivers?: Driver[];
    forms?: ClubForm[];
    createdBy?: string;
}
declare class ClubStatisticInput {
    name?: string;
    icon?: string;
    isCustomIcon?: boolean;
}
declare class WhoWeAreSectionInput {
    description?: string;
    images?: string[];
}
declare class ServiceInput {
    name?: string;
    image?: string;
}
declare class GalleryInput {
    images?: string[];
    videos?: string[];
}
declare class CoordinatesInput {
    lat?: number;
    lng?: number;
}
declare class LocationInput {
    description?: string;
    address?: string;
    image?: string;
    coordinates?: CoordinatesInput;
}
declare class DriverInput {
    name?: string;
    image?: string;
    nzfssRR?: string;
    ipssRR?: string;
}
declare class ClubFormInput {
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    fileData?: string;
}
export declare class CreateClubManagementInput {
    clubName?: string;
    shortDescription?: string;
    clubLogo?: string;
    coverImage?: string;
    statistics?: ClubStatisticInput[];
    whoWeAre?: WhoWeAreSectionInput[];
    services?: ServiceInput[];
    gallery?: GalleryInput;
    location?: LocationInput;
    drivers?: DriverInput[];
    forms?: ClubFormInput[];
}
export declare class UpdateClubManagementInput extends CreateClubManagementInput {
}
export declare class FindClubManagementByIdInput {
    clubId: string;
}
export {};
