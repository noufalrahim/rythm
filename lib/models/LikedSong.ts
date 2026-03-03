import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface SongData {
    title: string;
    artistName: string;
    coverUrl: string;
    duration: number;
    youtubeVideoId?: string;
    source: 'youtube' | 'db';
}

export interface ILikedSong extends Document {
    userId: Types.ObjectId;
    songId: string;
    songData: SongData;
    createdAt: Date;
}

const SongDataSchema = new Schema<SongData>(
    {
        title: { type: String, required: true },
        artistName: { type: String, default: '' },
        coverUrl: { type: String, default: '' },
        duration: { type: Number, default: 0 },
        youtubeVideoId: { type: String },
        source: { type: String, enum: ['youtube', 'db'], default: 'youtube' },
    },
    { _id: false }
);

const LikedSongSchema = new Schema<ILikedSong>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        songId: { type: String, required: true },
        songData: { type: SongDataSchema, required: true },
    },
    { timestamps: true }
);

// Unique per user per song
LikedSongSchema.index({ userId: 1, songId: 1 }, { unique: true });

const LikedSong: Model<ILikedSong> =
    mongoose.models.LikedSong || mongoose.model<ILikedSong>('LikedSong', LikedSongSchema);

export default LikedSong;
