import { getModelForClass, Prop } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class RcrPoints {
    @Field(() => String)
    _id: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    rcrFlag?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    rcrReg?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    rcrPedigreeName?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    rcrBreed?: string;

    @Field(() => Number, { nullable: true })
    @Prop({ required: false })
    rcrPoints?: number;

    @Field(() => Number, { nullable: true })
    @Prop({ required: false })
    rcrEvents?: number;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    rcrAwards?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    rcrCutoff?: string;

    @Field(() => Date, { nullable: true })
    @Prop({ required: true, default: Date.now })
    createdAt: Date;

    @Field(() => Date, { nullable: true })
    @Prop({ required: true, default: Date.now })
    updatedAt: Date;
}

export const RcrPointsModel = getModelForClass(RcrPoints); 