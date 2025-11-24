import mongoose, { Document, Model, Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import {Task} from "./task.js";

export interface IUser extends Document{
    name: string,
    age: number,
    email: string,
    password: string,
    avatar: Buffer,
    avatarMimeType: string,
    tokens: { token : string }[],
    generateAuthToken: () => Promise<string>
    toJSON: () => any,
}

interface IUserModel extends Model<IUser>{
    findByCredentials(email: string, password: string): Promise<IUser>
}

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true
    },

    age: {
        type: Number,
        default: 0,
        validate: {
            validator: (value: number) => value >= 0,
            message: 'Please enter a valid age'
        }
    },

    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (value: string) => validator.isEmail(value),
            message: 'Please enter a valid email'
        }
    },

    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate: {
            validator: (value: string)=> !value.toLowerCase().includes("password"),
            message: 'Please enter a valid password'
        }
    },

    avatar: {
        type: Buffer
    },

    avatarMimeType: {
        type: String
    },

    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]
    }, {
    timestamps: true
})

UserSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner",
})

UserSchema.methods.toJSON = function (): any {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    delete userObject.avatarMimeType

    return userObject
}

UserSchema.methods.generateAuthToken = async function (): Promise<string> {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET!, {expiresIn: "7 days"})

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

UserSchema.statics.findByCredentials = async (email: string, password: string): Promise<IUser> => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Unable to login");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Unable to login");

    return user
}

UserSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

UserSchema.pre('deleteOne', {document: true, query: false}, async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

export const User = mongoose.model<IUser, IUserModel>("User", UserSchema) as IUserModel;