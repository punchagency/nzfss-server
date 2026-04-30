import { getModelForClass, Prop } from "@typegoose/typegoose";
import { Field, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class DogInfo {
    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    petName?: string;

    @Field(() => Boolean, { nullable: true })
    @Prop({ required: false, default: false })
    isDeceased?: boolean;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    nzfssNumber?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    pedigreeName?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    breed?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    dateOfBirth?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    nzkcRegistration?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    nzkcOwner?: string;
}

@ObjectType()
export class Form {
    @Field(()=> String)
    _id: string

    @Field(() => String)
    @Prop({required: true})
    formName: string 

    @Field(() => String)
    @Prop({required: true})
    formType: string 

    @Field(() => String, { nullable: true })
    @Prop({required: false})
    file?: string 

    @Field({ nullable: true })
    @Prop({required: false})
    fileName: string 

    @Field(() => Date, { nullable: true })
    @Prop({ required: true, default: Date.now })  
    createdAt: Date;

    // Fields for musher registration
    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    applicantName?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    surname?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    firstName?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    address?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    dateOfBirth?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    phone?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    email?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    guardianDetails?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    nzfssRegistrationNumber?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    club?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    affiliationFrom?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    affiliationTo?: string;

    @Field(() => [DogInfo], { nullable: true })
    @Prop({ type: () => [DogInfo], required: false })
    dogs?: DogInfo[];

    @Field(() => Boolean, { nullable: true })
    @Prop({ required: false })
    showProfileConsent?: boolean;

    @Field(() => String, { nullable: true })
    @Prop({ required: false, default: "pending", enum: ["pending", "approved", "declined"] })
    status?: string;
}

export const FormModel = getModelForClass(Form);

@InputType("FormDogInput")
export class DogInput {
    @Field(() => String, { nullable: true })
    petName?: string;

    @Field(() => Boolean, { nullable: true })
    isDeceased?: boolean;

    @Field(() => String, { nullable: true })
    nzfssNumber?: string;

    @Field(() => String, { nullable: true })
    pedigreeName?: string;

    @Field(() => String, { nullable: true })
    breed?: string;

    @Field(() => String, { nullable: true })
    dateOfBirth?: string;

    @Field(() => String, { nullable: true })
    nzkcRegistration?: string;

    @Field(() => String, { nullable: true })
    nzkcOwner?: string;
}

@InputType()
export class CreateFormInput {
    @Field(() => String)
	formName: string;

    @Field(() => String)
	formType: string;

    @Field(() => String, { nullable: true })
    file?: string;

    @Field({ nullable: true })
	fileName?: string;
 
    // Fields for musher registration
    @Field(() => String, { nullable: true })
    applicantName?: string;

    @Field(() => String, { nullable: true })
    surname?: string;

    @Field(() => String, { nullable: true })
    firstName?: string;

    @Field(() => String, { nullable: true })
    address?: string;

    @Field(() => String, { nullable: true })
    dateOfBirth?: string;

    @Field(() => String, { nullable: true })
    phone?: string;

    @Field(() => String, { nullable: true })
    email?: string;

    @Field(() => String, { nullable: true })
    guardianDetails?: string;

    @Field(() => String, { nullable: true })
    nzfssRegistrationNumber?: string;

    @Field(() => String, { nullable: true })
    club?: string;

    @Field(() => String, { nullable: true })
    affiliationFrom?: string;

    @Field(() => String, { nullable: true })
    affiliationTo?: string;

    @Field(() => [DogInput], { nullable: true })
    dogs?: DogInput[];

    @Field(() => Boolean, { nullable: true })
    showProfileConsent?: boolean;

    @Field(() => String, { nullable: true })
    status?: string;
}

@InputType()
export class UpdateFormInput {
	@Field({ nullable: true })
	formName?: string;

	@Field({ nullable: true })
	formType?: string;

	@Field({ nullable: true })
	file?: string;

	@Field({ nullable: true })
	fileName?: string;

    @Field({ nullable: true })
    status?: string;
}

@InputType()
export class FindFormByIdInput {
    @Field()
    formId: string;
}
