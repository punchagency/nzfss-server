import { getModelForClass, Prop, pre } from "@typegoose/typegoose";
import { IsEmail, MaxLength, MinLength } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";
import bcrypt from 'bcryptjs';

@pre<Club>('save', async function() {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})
@ObjectType()
export class Club {
    @Field(()=> String)
    _id: string

    @Field(() => String)
    @Prop({required: true})
    clubName: string 

    @Field(() => String)
    @Prop({required: true})
    email: string 

    @Field(() => String)
    @Prop({required: true})
    password: string 

    @Field(() => Date, { nullable: true })
    @Prop({ required: true, default: Date.now })  
    createdAt: Date;

}

export const ClubModel = getModelForClass(Club);

@InputType()
export class CreateClubInput {
    @Field(() => String)
    clubName: string

    @IsEmail() 
    @Field(() => String)
    email: string

     @MinLength(6, {
    message: 'Password must be at least 6 characters long',
    })
    @MaxLength(50, {
        message: 'Password must not be longer than 50 characters',
    })
    @Field(() => String)
    password: string;
 
}

@InputType()
export class UpdateClubInput {
	@Field({ nullable: true })
	clubName?: string;

	@Field({ nullable: true })
	email?: string;

	@Field({ nullable: true })
    password?: string;

	@Field({ nullable: true })
    confirmPassword?: string;
}

@InputType()
export class FindClubByIdInput {
  @Field(() => String)
  _id: string;
}
