import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAlbum extends Document {
    title: string;
    artist: Types.ObjectId;
    coverUrl: string;
    year: number;
    genre: string;
}

const AlbumSchema = new Schema<IAlbum>(
    {
        title: { type: String, required: true },
        artist: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
        coverUrl: { type: String, default: '' },
        year: { type: Number, default: new Date().getFullYear() },
        genre: { type: String, default: 'Pop' },
    },
    { timestamps: true }
);

const Album: Model<IAlbum> =
    mongoose.models.Album || mongoose.model<IAlbum>('Album', AlbumSchema);

export default Album;
