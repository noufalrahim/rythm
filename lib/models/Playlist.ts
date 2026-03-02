import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPlaylist extends Document {
    name: string;
    description: string;
    coverUrl: string;
    songs: Types.ObjectId[];
    userId: string;
    isPublic: boolean;
}

const PlaylistSchema = new Schema<IPlaylist>(
    {
        name: { type: String, required: true },
        description: { type: String, default: '' },
        coverUrl: { type: String, default: '' },
        songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
        userId: { type: String, default: 'guest' },
        isPublic: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Playlist: Model<IPlaylist> =
    mongoose.models.Playlist || mongoose.model<IPlaylist>('Playlist', PlaylistSchema);

export default Playlist;
