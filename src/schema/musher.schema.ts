import { Field, ObjectType, InputType } from "type-graphql";
import { prop as Property } from "@typegoose/typegoose";
import { Club } from "./club.schema";
import { Ref } from "@typegoose/typegoose";

@ObjectType("DogType")
class Dog {
  @Field(() => String)
  @Property({ required: true })
  _id: string;

  @Field(() => String, { nullable: true })
  @Property({ required: false })
  name: string;

  @Field(() => String, { nullable: true })
  @Property({ type: String })
  pedigreeName: string;

  @Field(() => String, { nullable: true })
  @Property({ type: String })
  nzkcNo: string;

  @Field(() => String, { nullable: true })
  @Property({ type: String })
  nzfssNo: string;

  @Field(() => String, { nullable: true })
  @Property({ type: String, required: false, default: "N/A" })
  dateOfBirth: string;

  @Field(() => String, { nullable: true })
  @Property({ type: String, required: false, default: "N/A" })
  breed: string;

  @Field(() => Boolean)
  @Property({ type: Boolean, default: false })
  deceased: boolean;
}

@InputType("MusherDogInput")
export class DogInput {
  @Field(() => String, { nullable: true })
  _id?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  pedigreeName?: string;

  @Field({ nullable: true })
  nzkcNo?: string;

  @Field({ nullable: true })
  nzfssNo?: string;

  @Field({ nullable: true })
  dob?: string;

  @Field({ nullable: true })
  dateOfBirth?: string;

  @Field({ nullable: true })
  breed?: string;

  @Field(() => Boolean, { nullable: false })
  deceased: boolean;
}

@ObjectType()
export class Musher {
  @Field(() => String)
  id: string;

  @Field()
  @Property({ required: true })
  name: string;

  @Field({ nullable: true })
  @Property({ required: false })
  registrationNo?: string;

  @Field({ nullable: true })
  @Property({ required: false })
  kennelRegistrationNo?: string;

  @Field(() => String)
  @Property({ required: true, ref: () => Club, type: () => String })
  club: Ref<Club>;

  @Field({ nullable: true })
  @Property({ type: String, required: false })
  address?: string;

  @Field({ nullable: true })
  @Property({ type: String, required: false })
  phone?: string;

  @Field({ nullable: true })
  @Property({ type: String, required: false })
  email?: string;

  @Field({ nullable: true })
  @Property({ type: String, required: false })
  dateOfBirth?: string;

  @Field({ nullable: true })
  @Property({ type: String, required: false })
  guardianDetails?: string;

  @Field(() => [Dog])
  @Property({ type: () => [Dog] })
  dogs: Dog[];

  @Field(() => Boolean, { nullable: true })
  @Property({ type: Boolean, default: false })
  showProfileConsent?: boolean;

  @Field(() => Date)
  @Property({ type: Date })
  createdAt!: Date;

  @Field(() => Date)
  @Property({ type: Date })
  updatedAt!: Date;
}

@InputType("CreateMusherInput")
export class CreateMusherInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  registrationNo?: string;

  @Field({ nullable: true })
  kennelRegistrationNo?: string;

  @Field(() => String)
  clubId: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  dateOfBirth?: string;

  @Field({ nullable: true })
  guardianDetails?: string;

  @Field(() => [DogInput])
  dogs: DogInput[];
  
  @Field(() => Boolean, { nullable: true })
  showProfileConsent?: boolean;
}

@InputType()
export class UpdateMusherInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  registrationNo?: string;

  @Field({ nullable: true })
  kennelRegistrationNo?: string;

  @Field(() => String, { nullable: true })
  clubId?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  dateOfBirth?: string;

  @Field({ nullable: true })
  guardianDetails?: string;

  @Field(() => [DogInput], { nullable: true })
  dogs?: DogInput[];
  
  @Field(() => Boolean, { nullable: true })
  showProfileConsent?: boolean;
} 