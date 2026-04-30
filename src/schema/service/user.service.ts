import { ApolloError } from "apollo-server";
import { CreateUserInput, FindUserByIdInput, LoginInput, UpdateUserInput, User, UserModel, UserRole } from "../user.schema";
import Context from "../../types/context";
import bcrypt from "bcryptjs"
import { signJwt } from "../../utils/jwt";
import { isAdmin } from "../../utils/helpers";
import { Validate } from "../../utils/validateCheck";
import { logger } from "../../utils/logger";

class UserService {
    async createUser(input: CreateUserInput){
        const emailErr = `User with email: ${input.email} already exits`;
        const passwordErr = 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@#$&*-^!).';
        const emailInput = input.email.toLowerCase()

        try {
             // Validate the password using the utility function
                if (!Validate.isValidPassword(input.password)) {
                    throw new ApolloError(passwordErr);
                }
        
            // Check if the user already exists by email
            const existingUser = await UserModel.find().findByEmail(input.email).lean();
            if (existingUser) {
              throw new ApolloError(emailErr);
            }

        
            // Create the user
            const newUser = await UserModel.create({
                ...input,
                email: emailInput
            });

            return newUser;
          } catch (error) {
            // Catch any error that occurs in the try block and handle it
            if (error instanceof ApolloError) {
              // If the error is already an ApolloError, just throw it
              throw error;
            }
            
            // If the error is something else (e.g. validation or database error), log and rethrow
            logger.error('Error creating user:', error);
            throw new ApolloError('An unexpected error occurred while creating the user');
          }
    }
    async createClub(input: CreateUserInput): Promise<User>{
        const emailErr = `Club with email: ${input.email} already exits`;
        const passwordErr = 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@#$&*-^!).';
        const emailInput = input.email.toLowerCase()

        try {
             // Validate the password using the utility function
                if (!Validate.isValidPassword(input.password)) {
                    throw new ApolloError(passwordErr);
                }
        
            // Check if the user already exists by email
            const existingClub = await UserModel.find().findByEmail(input.email).lean();
            if (existingClub) {
              throw new ApolloError(emailErr);
            }

        
            // Create the Club
            const newClub = await UserModel.create({
                ...input,
                email: emailInput,
                role: UserRole.CLUB
            });

            return newClub;
          } catch (error) {
            // Catch any error that occurs in the try block and handle it
            if (error instanceof ApolloError) {
              // If the error is already an ApolloError, just throw it
              throw error;
            }
            
            // If the error is something else (e.g. validation or database error), log and rethrow
            logger.error('Error creating club:', error);
            throw new ApolloError('An unexpected error occurred while creating the club');
          }
    }

    async login(input: LoginInput, context: Context){
        const errorEmail = "Invalid email or password";
        const emailInput = input.email.toLowerCase()
console.log(emailInput, "emailInput")
        // await rateLimiter(30, 3, 'LOGIN', emailInput)(null, { email: input.email }, context, null);

        // Get user by email 
        const user =  await UserModel.findOne({email: emailInput}).lean();
        // console.log(user, "user in local")
        if(!user){
            throw new ApolloError(errorEmail)
        }

        // validate the password 

        const passwordIsValid = await bcrypt.compare(input.password, user.password)
        if(!passwordIsValid){
            throw new ApolloError(errorEmail)
        }
        
        const rememberMeMaxAge = input.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 7 days for both remember me and regular sessions
        
        const trimmedUser = {
            _id: user?._id,
            name: user?.name,
			email: user?.email,
			role: user?.role,
			
		}

        // sign a jwt 
        const token = signJwt(trimmedUser)

        // set a cookie for the jwt
        context.res.cookie("accessToken", token, {
            maxAge: rememberMeMaxAge,
            httpOnly: true,
            path: "/",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        });

        // Return user data with token for header-based auth fallback
        return {
            ...trimmedUser,
            token: token
        };
    }

    async findUserById(input: FindUserByIdInput, currentUser: User) {
        const e = " User with the given Id does not exist";
        const isAdmin = currentUser.role
        if(!isAdmin) {
            throw new ApolloError('Unauthorized');
        }

		let user = await UserModel.findById(input._id).lean();
		if (!user) {
			return new ApolloError(e);
		}
		return user;
	}

    async findClubById(input: FindUserByIdInput, currentUser: User) {
        const e = " Club with the given Id does not exist";
        const isAdmin = currentUser.role
        if(!isAdmin) {
            throw new ApolloError('Unauthorized');
        }

		let club = await UserModel.findById(input._id).lean();
		if (!club) {
			throw new ApolloError(e);
		}

		if (club.role !== UserRole.CLUB) {
			throw new ApolloError("Unauthorized");
		}
		return club;
	}

    async getAllUsers(user: User) {
         // Check if the user's role is 'admin'
        const isAdmin = user.role === 'ADMIN';

        // If the user is not an admin, throw an error or return a message
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admin can access this resource');
        }

		const users = await UserModel.find().lean();
		return users;
	}

    async getAllClubs(user: User): Promise<User[]> {
        // Check if the user's role is 'admin'
       const isAdmin = user.role === 'ADMIN';

       // If the user is not an admin, throw an error or return a message
       if (!isAdmin) {
           throw new Error('Unauthorized: Only admin can access this resource');
       }

       const clubs = await UserModel.find({ role: 'CLUB' })
       .sort({ createdAt: -1 })
       .lean();
       return clubs;
   }

    async updateUserProfile(
		input: UpdateUserInput & { user: User["_id"] },
		userInformation: User
	): Promise<User> {
		
		if (userInformation?.email !== input?.email && input?.email) {
			//email change attemp
			const userWithEmailExist = await UserModel.find({
				email: input?.email,
			}).lean();

			if (userWithEmailExist?.length) {
				throw new ApolloError(
					`User with email ${input.email} exist, kindly use another email!`
				);
			}
		}

		const user = await UserModel.findOneAndUpdate(
			{ _id: input?.user },
			{
				$set: input,
			},
			{ new: true }
		).lean();

		if (user) {
			return user;
		} else {
			throw new ApolloError("update failed");
		}
	}
    async updateClub(
		input: UpdateUserInput,
		userInformation: User,
        clubId: String
	): Promise<User> {
        const passwordErr = 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@#$&*-^!).';

        if(userInformation.role !== UserRole.ADMIN){
            throw new ApolloError("UnAuthorized to update this club")
        }
        

        if (input.password && input.newPassword) {

            if (!Validate.isValidPassword(input.newPassword)) {
                throw new ApolloError(passwordErr);
            }

            const club = await UserModel.findById(clubId).lean();
    
            if (!club) {
                throw new ApolloError("Club not found");
            }
    
            // Verify the current password provided by the user with the password stored in the database
            const isPasswordValid = await bcrypt.compare(input.password, club.password);
    
            if (!isPasswordValid) {
                throw new ApolloError("Current password is not incorrect");
            }

            // Hash the new password and update the input object
            const hashedNewPassword = await bcrypt.hash(input.newPassword, 10);
            input.password = hashedNewPassword;
    
        }

        if(input.email){
            if(!Validate.isValidEmail(input.email)){
                throw new ApolloError('Email is not valid')
            }
        }

		const user = await UserModel.findOneAndUpdate(
			{ _id: clubId },
			{
				$set: input,
			},
			{ new: true }
		).lean();

		if (user) {
			return user;
		} else {
			throw new ApolloError("update failed");
		}
	}

    async deleteUser(userId: String, user: User){
		const e = " User with the given Id does not exist";
		const initialUser = await UserModel.findById(userId).lean();
		if (!initialUser) {
			throw new ApolloError(e);
		}

        const isAdmin = user.role === 'ADMIN';
        
		if (!isAdmin) {
			throw new ApolloError('Unauthorized: Only admin can delete this user');
		}
		const deletedUser = await UserModel.findByIdAndDelete(initialUser._id).lean();

		return deletedUser;
	}
    async deleteClub(userId: String,  user: User){
		const e = " Club with the given Id does not exist";
		const club = await UserModel.findById(userId).lean();
		if (!club) {
			throw new ApolloError(e);
		}

        const isAdmin = user.role === 'ADMIN';
        
		if (!isAdmin) {
			throw new ApolloError('Unauthorized: Only admin can delete this Club');
		}
		const deletedClub = await UserModel.findByIdAndDelete(club._id).lean();

		return deletedClub
	}
}

export default UserService