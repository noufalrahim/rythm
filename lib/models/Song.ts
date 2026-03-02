import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISong extends Document {
    title: string;
    artist: Types.ObjectId;
    album: Types.ObjectId;
    duration: number; // seconds
    audioUrl: string;
    coverUrl: string;
    genre: string;
    plays: number;
    trackNumber: number;
}

const SongSchema = new Schema<ISong>(
    {
        title: { type: String, required: true },
        artist: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
        album: { type: Schema.Types.ObjectId, ref: 'Album' },
        duration: { type: Number, default: 0 },
        audioUrl: { type: String, default: '' },
        coverUrl: { type: String, default: '' },
        genre: { type: String, default: 'Pop' },
        plays: { type: Number, default: 0 },
        trackNumber: { type: Number, default: 1 },
    },
    { timestamps: true }
);

const Song: Model<ISong> =
    mongoose.models.Song || mongoose.model<ISong>('Song', SongSchema);

export default Song;
