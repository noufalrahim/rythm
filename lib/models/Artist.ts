import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArtist extends Document {
    name: string;
    bio: string;
    imageUrl: string;
    monthlyListeners: number;
    verified: boolean;
}

const ArtistSchema = new Schema<IArtist>(
    {
        name: { type: String, required: true },
        bio: { type: String, default: '' },
        imageUrl: { type: String, default: '' },
        monthlyListeners: { type: Number, default: 0 },
        verified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Artist: Model<IArtist> =
    mongoose.models.Artist || mongoose.model<IArtist>('Artist', ArtistSchema);

export default Artist;
