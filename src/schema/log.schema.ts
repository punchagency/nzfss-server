import { getModelForClass, Prop, Ref } from "@typegoose/typegoose";
import { Field, InputType, ObjectType } from "type-graphql";
import { User } from "./user.schema";

@ObjectType()
export class Log {
    @Field(() => String)
    _id: string;

    @Field(() => String)
    @Prop({ required: true, ref: () => User })
    userId: Ref<User>;

    @Field(() => String)
    @Prop({ required: true })
    action: string; // e.g., "update"

    @Field(() => String)
    @Prop({ required: true })
    entity: string; // e.g., "Dogs"

    @Field(() => String)
    @Prop({ required: true })
    entityId: string; // ID of the entity being updated

    @Field(() => String)
    @Prop({ required: true })
    oldData: string; // JSON string of the old data

    @Field(() => String)
    @Prop({ required: true })
    newData: string; // JSON string of the new data

    @Field(() => Date, { nullable: true })
    @Prop({ required: true, default: Date.now })
    createdAt: Date;
}

export const LogModel = getModelForClass(Log);

@InputType()
export class CreateLogInput {
    @Field(() => String)
    userId: string;

    @Field(() => String)
    action: string;

    @Field(() => String)
    entity: string;

    @Field(() => String)
    entityId: string;

    @Field(() => String)
    oldData: string;

    @Field(() => String)
    newData: string;
}

@InputType()
export class FindLogsByIdInput {
	@Field(() => String)
	_id: string;
}
