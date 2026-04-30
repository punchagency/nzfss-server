import { getModelForClass, Prop } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class WprPoints {
    @Field(() => String)
    _id: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    wprFlag?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    wprReg?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    wprPedigreeName?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    wprBreed?: string;

    @Field(() => Number, { nullable: true })
    @Prop({ required: false })
    wprMaxWeight?: number;

    @Field(() => Number, { nullable: true })
    @Prop({ required: false })
    wprMaxBWR?: number;

    @Field(() => Number, { nullable: true })
    @Prop({ required: false })
    wprPoints?: number;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    wprAwards?: string;

    @Field(() => Date, { nullable: true })
    @Prop({ required: true, default: Date.now })
    createdAt: Date;

    @Field(() => Date, { nullable: true })
    @Prop({ required: true, default: Date.now })
    updatedAt: Date;
}

export const WprPointsModel = getModelForClass(WprPoints); 