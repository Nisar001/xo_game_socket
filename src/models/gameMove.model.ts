import mongoose from 'mongoose';

export interface IGameMove extends mongoose.Document {
  roomId: string;
  userId: mongoose.Types.ObjectId;
  symbol: string; // 'X' or 'O'
  position: number; // index on the board
  createdAt: Date;
  updatedAt: Date;
}

const moveSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  symbol: { type: String },
  position: { type: Number },
}, { timestamps: true });

export const GameMove = mongoose.model('GameMove', moveSchema);
