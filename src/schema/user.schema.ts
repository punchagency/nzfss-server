import { getModelForClass, index, pre, Prop, queryMethod, ReturnModelType } from "@typegoose/typegoose";
import { IsEmail, MaxLength, MinLength, Matches  } from "class-validator";
import { Field, InputType, ObjectType, registerEnumType, ID } from "type-graphql";
import bcrypt from 'bcryptjs'
import { AsQueryMethod } from "@typegoose/typegoose/lib/types";
import { Club } from "./club.schema";


export enum UserRole {
	ADMIN = 'ADMIN',
	CLUB = 'CLUB',
}

registerEnumType(UserRole, {
	name: "UserRole",
});

function findByEmail(
    this: ReturnModelType<typeof User, QueryHelpers>,
    email: User["email"]
  ) {
    return this.findOne({ email });
  }
  
  interface QueryHelpers {
    findByEmail: AsQueryMethod<typeof findByEmail>;
  }
  

@pre<User>('save', async function (){
    if(!this.isModified('password')){
        return
    }

    const salt = await bcrypt.genSalt(10)

    const hash = await bcrypt.hashSync(this.password, salt)

    this.password = hash;
})
@index({ email: 1 })
@queryMethod(findByEmail)
@ObjectType()
export class User {
    @Field(() => ID)
    _id: string

    @Field(() => String)
    @Prop({required: true})
    name: string 

    @Field(() => String)
    @Prop({ required: true, unique: true })
    email: string 

    @Prop({required: true})
    password: string 

    @Field({ nullable: true })
    @Prop({ required: false })
    gender?: string;

    @Field({ nullable: true })
    @Prop({ required: false })
    address?: string;

    @Field({ nullable: true })
    @Prop({ required: false })
    city?: string;

    @Field({ nullable: true })
    @Prop({ required: false })
    postCode?: string;

    @Field({ nullable: true })
    @Prop({ required: false })
    dob?: string;

    @Field(() => UserRole)
    @Prop({ required: true, default: UserRole.ADMIN })
    role: UserRole;

    @Field(() => Club, { nullable: true })
    @Prop({ ref: 'Club' })
    club?: Club;

    @Field()
    @Prop({ required: true, default: Date.now })  
    created_at: Date;
}

@ObjectType()
export class LoginResponse {
    @Field(() => ID)
    _id: string;

    @Field(() => String)
    name: string;

    @Field(() => String)
    email: string;

    @Field(() => UserRole)
    role: UserRole;

    @Field(() => String, { nullable: true })
    token?: string;
}

export const UserModel = getModelForClass(User)

@InputType()
export class CreateUserInput {
    @Field(() => String)
    name: string

    @IsEmail()
    @Field(() => String)
    email: string

     @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  @MaxLength(50, {
    message: 'Password must not be longer than 50 characters',
  })
  @Matches(/^(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: 'Password must contain at least one special character',
  })
  @Field(() => String)
  password: string;

  @Field(() => UserRole, { nullable: true })
  role: UserRole; 
}

@InputType()
export class LoginInput {
    @Field(() => String)
    email: string;

    @Field(() => String)
    password: string;

    @Field({ nullable: true })
    rememberMe: boolean;
}

@InputType()
export class FindUserByIdInput {
	@Field(() => String)
	_id: string;
}

@InputType()
export class UpdateUserInput {
	@Field({ nullable: true })
	name?: string;

  @Field({ nullable: true })
	email?: string;

  @Field({nullable: true })
  password?: string;

  @Field({nullable: true })
  newPassword?: string;
  
}

