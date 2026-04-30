import { getModelForClass, Prop } from "@typegoose/typegoose";
import { Field, InputType, ObjectType, registerEnumType } from "type-graphql";

export enum Status {
  Pending = "Pending",
  Approve = "Approve",
  Declined = "Declined",
}

registerEnumType(Status, {
  name: "Status",
});

@ObjectType()
export class EventCalendar {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @Prop({ required: true })
  preferredDate: string;

  @Field(() => String)
  @Prop({ required: true })
  alternativeDate: string;

  @Field(() => Boolean)
  @Prop({ required: true, default: false })
  date: boolean;

  @Field(() => Boolean)
  @Prop({ required: true, default: false })
  NZFSSSanctioning: boolean;

  @Field(() => Boolean)
  @Prop({ required: true, default: false })
  public: boolean;

  @Field(() => Boolean)
  @Prop({ required: true, default: false })
  isSubmitted: boolean;

  @Field(() => Status)
  @Prop({ required: true, default: Status.Pending })
  status: Status;

  @Field(() => String)
  @Prop({ required: true })
  eventName: string;

  @Field({ nullable: true })
  @Prop({ required: false })
  eventDate: string;

  @Field(() => String)
  @Prop({ required: true })
  club: string;

  @Field(() => String)
  @Prop({ required: true })
  region: string;

  @Field({ nullable: true })
  @Prop({ required: false })
  entryForm: string;

  @Field({ nullable: true })
  @Prop({ required: false })
  fileName: string;

  @Field({ nullable: true })
  @Prop({ required: false })
  website: string;

  @Field({ nullable: true })
  @Prop({ required: false })
  reason: string;

  @Field({ nullable: true })
  @Prop({ required: false })
  photo: string;

  @Field(() => String)
  @Prop({ required: true })
  type: string;

  @Field(() => Boolean)
  @Prop({ required: true, default: false })
  result: boolean;

  @Field(() => Date, { nullable: true })
  @Prop({ required: false, default: Date.now })
  createdAt?: Date;

  @Field(() => String)
  @Prop({ required: true, ref: "User" })
  clubId: string;
}

export const EventCalendarModel = getModelForClass(EventCalendar);

@InputType()
export class CreateEventCalendarInput {
  @Field(() => String)
  preferredDate: string;

  @Field(() => String)
  alternativeDate: string;

  @Field(() => String)
  eventName: string;

  @Field(() => String)
  eventDate: string;

  @Field(() => String)
  club: string;

  @Field(() => String)
  region: string;

  @Field({ nullable: true })
  photo: string;

  @Field({ nullable: true })
  entryForm?: string;

  @Field({ nullable: true })
  fileName?: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  clubId: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  reason?: string;

  @Field(() => Boolean)
  date: boolean;

  @Field(() => Boolean)
  NZFSSSanctioning: boolean;

  @Field(() => Boolean)
  public: boolean;

  @Field(() => Status)
  status: Status;

  @Field(() => Boolean)
  isSubmitted: boolean;

  @Field(() => Boolean)
  result: boolean;
}

@InputType()
export class UpdateEventCalendarInput {
  @Field(() => String, { nullable: true })
  preferredDate?: string;

  @Field(() => String, { nullable: true })
  alternativeDate?: string;

  @Field(() => Boolean, { nullable: true })
  date?: boolean;

  @Field(() => Boolean, { nullable: true })
  NZFSSSanctioning?: boolean;

  @Field(() => Boolean, { nullable: true })
  public?: boolean;

  @Field(() => Boolean, { nullable: true })
  isSubmitted?: boolean;

  @Field(() => Status, { nullable: true })
  status?: Status;

  @Field(() => String, { nullable: true })
  eventName?: string;

  @Field(() => String, { nullable: true })
  eventDate?: string;

  @Field(() => String, { nullable: true })
  club?: string;

  @Field(() => String, { nullable: true })
  clubId?: string;

  @Field(() => String, { nullable: true })
  region?: string;

  @Field(() => String, { nullable: true })
  entryForm?: string;

  @Field(() => String, { nullable: true })
  fileName?: string;

  @Field(() => String, { nullable: true })
  photo?: string;

  @Field(() => String, { nullable: true })
  type?: string;

  @Field(() => Boolean, { nullable: true })
  result?: boolean;

  @Field(() => String, { nullable: true })
  website?: string;

  @Field(() => String, { nullable: true })
  reason?: string;
}

@InputType()
export class FindEventCalendarByIdInput {
  @Field(() => String)
  _id: string;
} 