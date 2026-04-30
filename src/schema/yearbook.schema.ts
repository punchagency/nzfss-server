import { getModelForClass, Prop } from "@typegoose/typegoose";
import { Field, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class Yearbook {
    @Field(()=> String)
    _id: string

    @Field(() => String)
    @Prop({required: true})
    yearbook: string 

    @Field(() => String)
    @Prop({required: true})
    yearbookName: string 

    @Field(() => String)
    @Prop({required: true})
    yearPublish: string 

}

export const YearbookModel = getModelForClass(Yearbook);

@InputType()
export class CreateYearbookInput {
    @Field(() => String)
	yearbook: string;

    @Field(() => String)
	yearbookName: string;

    @Field(() => String)
    yearPublish: string
 
}

@InputType()
export class UpdateYearbookInput {
	@Field({ nullable: true })
	yearbook?: string;

	@Field({ nullable: true })
	yearbookName?: string;

	@Field({ nullable: true })
	yearPublish?: string;
}

@InputType()
export class FindYearbookByIdInput {
	@Field(() => String)
	_id: string;
}
