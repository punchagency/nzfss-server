import { Field, ObjectType, InputType } from "type-graphql";
import { prop as Property } from "@typegoose/typegoose";
import { IsEmail, IsString, MinLength } from "class-validator";
import { User } from "./user.schema";
import { Ref } from "@typegoose/typegoose";

@ObjectType()
export class Contact {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @Property({ required: true })
  name: string;

  @Field(() => String)
  @Property({ required: true })
  designation: string;

  @Field(() => String)
  @Property({ required: true })
  email: string;

  @Field(() => String, { nullable: true })
  @Property()
  image?: string;

  @Field(() => Date)
  @Property({ default: Date.now })
  created_at: Date;

  @Field(() => String)
  @Property({ required: true, ref: () => User })
  club: Ref<User>;
}

@InputType()
export class CreateContactInput {
  @Field(() => String)
  @IsString()
  @MinLength(2)
  name: string;

  @Field(() => String)
  @IsString()
  designation: string;

  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => String)
  @IsString()
  clubId: string;
}

@InputType()
export class UpdateContactInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @MinLength(2)
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  designation?: string;

  @Field(() => String, { nullable: true })
  @IsEmail()
  email?: string;

  @Field(() => String, { nullable: true })
  image?: string;
}

@InputType()
export class FindContactByIdInput {
  @Field(() => String)
  contactId: string;
} 