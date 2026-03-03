import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface PlaylistSongData {
    songId: string;
    title: string;
    artistName: string;
    coverUrl: string;
    duration: number;
    youtubeVideoId?: string;
    source: 'youtube' | 'db';
}

export interface IPlaylist extends Document {
    name: string;
    description: string;
    coverUrl: string;
    userId: Types.ObjectId;
    songs: PlaylistSongData[];
    isPublic: boolean;
    createdAt: Date;
}

const PlaylistSongSchema = new Schema<PlaylistSongData>(
    {
        songId: { type: String, required: true },
        title: { type: String, required: true },
        artistName: { type: String, default: '' },
        coverUrl: { type: String, default: '' },
        duration: { type: Number, default: 0 },
        youtubeVideoId: { type: String },
        source: { type: String, enum: ['youtube', 'db'], default: 'youtube' },
    },
    { _id: false }
);

const PlaylistSchema = new Schema<IPlaylist>(
    {
        name: { type: String, required: true },
        description: { type: String, default: '' },
        coverUrl: { type: String, default: '' },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        songs: { type: [PlaylistSongSchema], default: [] },
        isPublic: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Playlist: Model<IPlaylist> =
    mongoose.models.Playlist || mongoose.model<IPlaylist>('Playlist', PlaylistSchema);

export default Playlist;
