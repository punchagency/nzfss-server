import { getModelForClass, Prop } from "@typegoose/typegoose";
import { Field, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class Rules {
    @Field(()=> String)
    _id: string

    @Field(() => String)
    @Prop({required: true})
    constitutionRules: string 

    @Field(() => String)
    @Prop({required: true})
    amendedDate: string 

    @Field(() => String)
    @Prop({ required: true })
    file: string 

    @Field({ nullable: true })
    @Prop({required: false})
    fileName: string 

    @Field(() => Date, { nullable: true })
    @Prop({ required: true, default: Date.now })  
    createdAt: Date;

}

export const RulesModel = getModelForClass(Rules);

@InputType()
export class CreateRulesInput {
    @Field(() => String)
	constitutionRules: string;

    @Field(() => String)
	amendedDate: string;

    @Field(() => String)
	file: string;

    @Field({ nullable: true })
	fileName?: string;
 
}

@InputType()
export class UpdateRulesInput {
	@Field({ nullable: true })
	constitutionRules?: string;

	@Field({ nullable: true })
	amendedDate?: string;

	@Field({ nullable: true })
	file?: string;

    @Field({ nullable: true })
	fileName?: string;

}

@InputType()
export class FindRulesByIdInput {
	@Field(() => String)
	_id: string;
}
