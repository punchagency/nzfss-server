import { Field, InputType, ObjectType } from "type-graphql";
import { Prop } from "@typegoose/typegoose";

@ObjectType()
@InputType("HeatDataInput")
export class HeatData {
    @Field(() => String)
    @Prop({ required: true })
    heat: string;
  
    @Field(() => String)
    @Prop({ required: true })
    temperature: string;
  
    @Field(() => String)
    @Prop({ required: true })
    distance: string;
  
    @Field(() => String)
    @Prop({ required: true })
    class: string;
} 