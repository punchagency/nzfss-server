import { Field, InputType, ObjectType } from "type-graphql";
import { prop as Property } from "@typegoose/typegoose";
import { IsString, IsOptional, IsArray, IsUrl, IsNumber } from "class-validator";

@ObjectType()
export class ClubStatistic {
  @Field({ nullable: true })
  @Property({ required: false })
  name?: string;

  @Field({ nullable: true })
  @Property({ required: false })
  icon?: string;

  @Field({ nullable: true })
  @Property({ default: false })
  isCustomIcon?: boolean;
}

@ObjectType()
export class WhoWeAreSection {
  @Field({ nullable: true })
  @Property({ required: false })
  description?: string;

  @Field(() => [String], { nullable: true })
  @Property({ type: () => [String], required: false })
  images?: string[];
}

@ObjectType()
export class Service {
  @Field({ nullable: true })
  @Property({ required: false })
  name?: string;

  @Field({ nullable: true })
  @Property({ required: false })
  image?: string;
}

@ObjectType()
export class Gallery {
  @Field(() => [String], { nullable: true })
  @Property({ type: () => [String], required: false })
  images?: string[];

  @Field(() => [String], { nullable: true })
  @Property({ type: () => [String], required: false })
  videos?: string[];
}

@ObjectType()
class Coordinates {
  @Field({ nullable: true })
  @Property({ required: false })
  lat?: number;

  @Field({ nullable: true })
  @Property({ required: false })
  lng?: number;
}

@ObjectType()
export class Location {
  @Field({ nullable: true })
  @Property({ required: false })
  description?: string;

  @Field({ nullable: true })
  @Property({ required: false })
  address?: string;

  @Field({ nullable: true })
  @Property({ required: false })
  image?: string;

  @Field(() => Coordinates, { nullable: true })
  @Property({ type: () => Coordinates, required: false })
  coordinates?: Coordinates;
}

@ObjectType()
export class Driver {
  @Field({ nullable: true })
  @Property({ required: false })
  name?: string;

  @Field({ nullable: true })
  @Property({ required: false })
  image?: string;

  @Field({ nullable: true })
  @Property({ required: false })
  nzfssRR?: string;

  @Field({ nullable: true })
  @Property({ required: false })
  ipssRR?: string;
}

@ObjectType()
export class ClubForm {
  @Field({ nullable: true })
  @Property({ required: false })
  fileName?: string;

  @Field({ nullable: true })
  @Property({ required: false })
  fileType?: string;

  @Field({ nullable: true })
  @Property({ required: false })
  fileSize?: number;

  @Field({ nullable: true })
  @Property({ required: false })
  fileData?: string;
}

@ObjectType()
export class ClubManagement {
  @Field({ nullable: true })
  @Property({ required: false })
  clubName?: string;

  @Field({ nullable: true })
  @Property({ required: false })
  shortDescription?: string;

  @Field({ nullable: true })
  @Property({ required: false })
  clubLogo?: string;

  @Field({ nullable: true })
  @Property({ required: false })
  coverImage?: string;

  @Field(() => [ClubStatistic], { nullable: true })
  @Property({ type: () => [ClubStatistic], required: false })
  statistics?: ClubStatistic[];

  @Field(() => [WhoWeAreSection], { nullable: true })
  @Property({ type: () => [WhoWeAreSection], required: false })
  whoWeAre?: WhoWeAreSection[];

  @Field(() => [Service], { nullable: true })
  @Property({ type: () => [Service], required: false })
  services?: Service[];

  @Field(() => Gallery, { nullable: true })
  @Property({ type: () => Gallery, required: false })
  gallery?: Gallery;

  @Field(() => Location, { nullable: true })
  @Property({ type: () => Location, required: false })
  location?: Location;

  @Field(() => [Driver], { nullable: true })
  @Property({ type: () => [Driver], required: false })
  drivers?: Driver[];

  @Field(() => [ClubForm], { nullable: true })
  @Property({ type: () => [ClubForm], required: false })
  forms?: ClubForm[];

  @Field(() => String, { nullable: true })
  @Property({ required: false })
  createdBy?: string;
}

// Move all Input type definitions before CreateClubManagementInput
@InputType()
class ClubStatisticInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  isCustomIcon?: boolean;
}

@InputType()
class WhoWeAreSectionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  images?: string[];
}

@InputType()
class ServiceInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  image?: string;
}

@InputType()
class GalleryInput {
  @Field(() => [String], { nullable: true })
  @IsOptional()
  images?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  videos?: string[];
}

@InputType()
class CoordinatesInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  lng?: number;
}

@InputType()
class LocationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  image?: string;

  @Field(() => CoordinatesInput, { nullable: true })
  @IsOptional()
  coordinates?: CoordinatesInput;
}

@InputType()
class DriverInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  image?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nzfssRR?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ipssRR?: string;
}

@InputType()
class ClubFormInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fileName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fileType?: string;

  @Field({ nullable: true })
  @IsOptional()
  fileSize?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fileData?: string;
}

@InputType()
export class CreateClubManagementInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  clubName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  clubLogo?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  coverImage?: string;

  @Field(() => [ClubStatisticInput], { nullable: true })
  @IsOptional()
  statistics?: ClubStatisticInput[];

  @Field(() => [WhoWeAreSectionInput], { nullable: true })
  @IsOptional()
  whoWeAre?: WhoWeAreSectionInput[];

  @Field(() => [ServiceInput], { nullable: true })
  @IsOptional()
  services?: ServiceInput[];

  @Field(() => GalleryInput, { nullable: true })
  @IsOptional()
  gallery?: GalleryInput;

  @Field(() => LocationInput, { nullable: true })
  @IsOptional()
  location?: LocationInput;

  @Field(() => [DriverInput], { nullable: true })
  @IsOptional()
  drivers?: DriverInput[];

  @Field(() => [ClubFormInput], { nullable: true })
  @IsOptional()
  forms?: ClubFormInput[];
}

@InputType()
export class UpdateClubManagementInput extends CreateClubManagementInput {}

@InputType()
export class FindClubManagementByIdInput {
  @Field()
  @IsString()
  clubId: string;
}