import { getModelForClass, Prop, Ref } from "@typegoose/typegoose";
import { Field, InputType, ObjectType } from "type-graphql";
import { User } from "./user.schema";

@ObjectType()
export class Dogs {
    @Field(()=> String)
    _id: string

    @Field(() => String)
    @Prop({required: true})
    driverName: string 

    @Field(() => String)
    @Prop({required: true})
    name: string 

    @Field(() => String)
    @Prop({required: true})
    NZFSSRegistration: string 

    @Field(() => String, { nullable: true })
    @Prop({required: false})
    DateOfBirth?: string 

    @Field(() => String)
    @Prop({required: true})
    Breed: string 

    @Field(() => String)
    @Prop({ required: true, ref: () => User })
    userId: Ref<User>;

    @Field(() => Date, { nullable: true })
    @Prop({ required: true, default: Date.now })  
    createdAt: Date;

}

export const DogsModel = getModelForClass(Dogs);

@InputType()
export class CreateDogInput {
    @Field(() => String)
	driverName: string;

    @Field(() => String)
	name: string;

    @Field(() => String)
	NZFSSRegistration: string;

    @Field(() => String, { nullable: true })
	DateOfBirth?: string;

    @Field(() => String)
	Breed: string;
 
}

@InputType()
export class UpdateDogsInput {
	@Field({ nullable: true })
	driverName?: string;

	@Field({ nullable: true })
	name?: string;

	@Field({ nullable: true })
	NZFSSRegistration?: string;

	@Field({ nullable: true })
	DateOfBirth?: string;

	@Field({ nullable: true })
	Breed?: string;
}

@InputType()
export class FindDogsByIdInput {
	@Field(() => String)
	_id: string;
}
