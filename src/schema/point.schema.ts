import { getModelForClass, Prop, Ref } from "@typegoose/typegoose";
import { Field, InputType, ObjectType } from "type-graphql";
import { Entrants } from "./entrants.schema";
import { HeatData } from './heat.schema';

@ObjectType()
export class DogPoint {
    @Field(() => String)
    NZFSSRegistration: string;

    @Field(() => Number)
    points: number;

    @Field(() => Number, { nullable: true, defaultValue: 0 })
    cutoffPoints?: number;
}

@ObjectType()
export class Point {
    @Field(() => String)
    _id: string;

    @Field(() => String)
    @Prop({ required: true })
    entrantId: string;

    @Field(() => Number)
    @Prop({ required: true })
    points: number;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    cutoffTime?: string;

    @Field(() => [DogPoint], { nullable: true })
    @Prop({ 
        type: () => [Object], 
        default: [],
        // Ensure the database can store the cutoffPoints field
        validate: {
            validator: function(dogPoints: any[]) {
                return dogPoints.every(dp => 
                    typeof dp.NZFSSRegistration === 'string' &&
                    typeof dp.points === 'number' &&
                    (dp.cutoffPoints === undefined || typeof dp.cutoffPoints === 'number')
                );
            },
            message: 'Each dog point must have valid NZFSSRegistration, points, and optional cutoffPoints'
        }
    })
    dogPoints?: DogPoint[];

    @Field(() => [HeatData], { nullable: true })
    @Prop({ type: () => [Object], default: [] })
    heatsData?: HeatData[];

    @Field(() => Date, { nullable: true })
    @Prop({ required: true, default: Date.now })
    createdAt: Date;

    @Field(() => Date, { nullable: true })
    @Prop({ required: true, default: Date.now })
    updatedAt: Date;
    
    @Field(() => Entrants, { nullable: true })
    entrant?: Entrants;
}

export const PointModel = getModelForClass(Point);

@InputType()
export class DogPointInput {
    @Field(() => String)
    NZFSSRegistration: string;

    @Field(() => Number)
    points: number;

    @Field(() => Number, { defaultValue: 0 })
    cutoffPoints: number;
}

@InputType()
export class PointsInput {
    @Field(() => String)
    entrantId: string;

    @Field(() => Number)
    points: number;

    @Field(() => String, { nullable: true })
    cutoffTime?: string;

    @Field(() => [DogPointInput])
    dogPoints: DogPointInput[];

    @Field(() => [HeatData], { nullable: true })
    heatsData?: HeatData[];
}

@ObjectType()
export class SubmitPointsResponse {
    @Field(() => Boolean)
    success: boolean;

    @Field(() => String, { nullable: true })
    message?: string;

    @Field(() => [Point], { nullable: true })
    points?: Point[];
} 