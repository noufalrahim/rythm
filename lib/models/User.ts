import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email?: string;
    phone?: string;
    passwordHash: string;
    avatar: string;
    bio: string;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            sparse: true,
            unique: true,
        },
        phone: {
            type: String,
            trim: true,
            sparse: true,
            unique: true,
        },
        passwordHash: { type: String, required: true },
        avatar: { type: String, default: '' },
        bio: { type: String, default: '' },
    },
    { timestamps: true }
);

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
