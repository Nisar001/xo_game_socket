import mongoose from 'mongoose';

export interface IGameRoom extends mongoose.Document {
  roomId: string;
  players: { userId: mongoose.Types.ObjectId; symbol: string }[];
  status: 'waiting' | 'playing' | 'finished';
  turn: string;
  winner: string;
  board: string[];
  createdAt: Date;
  updatedAt: Date;
}

const gameRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    symbol: { type: String } // 'X' or 'O'
  }],
  status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
  turn: { type: String }, // 'X' or 'O'
  winner: { type: String }, // 'X', 'O', 'draw'
  board: { type: [String], default: Array(9).fill('') }
}, { timestamps: true });

export const GameRoom = mongoose.model('GameRoom', gameRoomSchema);

