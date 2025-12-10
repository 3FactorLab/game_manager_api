/**
 * @file user.model.ts
 * @description Mongoose model for user authentication and profiles.
 * Defines the schema, interface, and role enum for users.
 */
import mongoose, { Document, Schema, Types } from "mongoose";
import { UserRole } from "../types/enums";

export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password?: string;
    profilePicture: string;
    role: UserRole;
    wishlist: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export type UserDocument = IUser & Document;

const userSchema: Schema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.USER,
        },
        wishlist: [
            {
                type: Schema.Types.ObjectId,
                ref: "Game",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model<UserDocument>("User", userSchema);

export default User;
