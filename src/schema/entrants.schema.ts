import { getModelForClass, Prop, Ref } from "@typegoose/typegoose";
import { Field, InputType, ObjectType } from "type-graphql";
import { User } from "./user.schema";
import { EventCalendar } from "./calendar.schema";
import { HeatData } from './heat.schema';

@ObjectType()
@InputType("DogInput")
export class Dog {
    @Field(() => String)
    @Prop({ required: true })
    driverName: string;
  
    @Field(() => String)
    @Prop({ required: true })
    name: string;
  
    @Field(() => String)
    @Prop({ required: false })
    NZFSSRegistration: string;
  
    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    dob?: string;
  
    @Field(() => String)
    @Prop({ required: false })
    breed: string;
}

@ObjectType()
export class Entrants {
    @Field(()=> String)
    _id: string

    @Field(() => String)
    @Prop({required: true})
    raceFormat: string 

    @Field(() => String)
    @Prop({required: true})
    class: string 

    @Field(() => String)
    @Prop({required: true})
    customClass: string 

    @Field(() => String)
    @Prop({required: true})
    name: string 

    @Field(() => [Dog])
    @Prop({ required: true, type: () => [Dog] })
    associatedDog: Dog[];

    @Field(() => String)
    @Prop({required: true})
    raceType: string; 

    @Field(() => String, { nullable: true })
    @Prop({required: false})
    startTime?: string; 

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    raceTime?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    cutoffTime?: string;

    @Field(() => String)
    @Prop({ required: true, ref: () => User })
    userId: Ref<User>;

    @Field(() => String)
    @Prop({ required: true, ref: () => EventCalendar })
    eventId: Ref<EventCalendar>;
    
    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    temperature?: string;
    
    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    distance?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    heat?: string;

    @Field(() => [HeatData], { nullable: true })
    @Prop({ required: false, type: () => [HeatData] })
    heatsData?: HeatData[];

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    dogWeight?: string;

    @Field(() => String, { nullable: true })
    @Prop({ required: false })
    weightPulled?: string;

    @Field(() => Date, { nullable: true })
    @Prop({ required: true, default: Date.now })
    createdAt: Date;
}

export const EntrantModel = getModelForClass(Entrants);

@InputType()
export class CreateEntrantInput {
    @Field(() => String)
	name: string;

    @Field(() => String)
	raceFormat: string;
    
    @Field(() => String)
	class: string;

    @Field(() => String)
	customClass: string;

    @Field(() => [Dog])
    associatedDog: Dog[];

    @Field(() => String)
	raceType: string;

    @Field(() => String, { nullable: true })
	startTime?: string;
    
    @Field(() => String, { nullable: true })
    raceTime?: string;

    @Field(() => String, { nullable: true })
    cutoffTime?: string;

    @Field(() => String)
	eventId: string;
    
    @Field(() => String, { nullable: true })
    temperature?: string;
    
    @Field(() => String, { nullable: true })
    distance?: string;

    @Field(() => String, { nullable: true })
    heat?: string;

    @Field(() => [HeatData], { nullable: true })
    heatsData?: HeatData[];

    @Field(() => String, { nullable: true })
    dogWeight?: string;

    @Field(() => String, { nullable: true })
    weightPulled?: string;
}

@InputType()
export class UpdateEntrantInput {
	@Field({ nullable: true })
	name?: string;

    @Field(() => [Dog], { nullable: true })
    associatedDog?: Dog[];

	@Field({ nullable: true })
	raceFormat?: string;

	@Field({ nullable: true })
	class?: string;

	@Field({ nullable: true })
	customClass?: string;

	@Field({ nullable: true })
	raceType?: string;

	@Field({ nullable: true })
	startTime?: string;
    
    @Field({ nullable: true })
    raceTime?: string;

    @Field({ nullable: true })
    cutoffTime?: string;
    
    @Field({ nullable: true })
    temperature?: string;
    
    @Field({ nullable: true })
    distance?: string;

    @Field({ nullable: true })
    heat?: string;

    @Field(() => [HeatData], { nullable: true })
    heatsData?: HeatData[];

    @Field({ nullable: true })
    dogWeight?: string;

    @Field({ nullable: true })
    weightPulled?: string;
}

@InputType()
export class FindEntrantByIdInput {
	@Field(() => String)
	_id: string;
}
