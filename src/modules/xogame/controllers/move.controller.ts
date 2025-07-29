import { Request, Response } from 'express';
import { GameMove } from '../../../models/gameMove.model';
import { GameRoom } from '../../../models/gameRoom.model';
import User from '../../../models/user.model';

// Get all moves (with optional pagination)
export const getAllMoves = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const [moves, total] = await Promise.all([
      GameMove.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      GameMove.countDocuments()
    ]);
    res.json({ results: moves, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get all moves by a specific user
export const getUserMoves = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const moves = await GameMove.find({ userId }).sort({ createdAt: -1 });
    res.json(moves);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get all moves for a specific match (game room)
export const getMatchMoves = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const moves = await GameMove.find({ roomId }).sort({ createdAt: 1 });
    res.json(moves);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get all moves for a specific user in a specific match
export const getUserMatchMoves = async (req: Request, res: Response) => {
  try {
    const { userId, roomId } = req.params;
    const moves = await GameMove.find({ userId, roomId }).sort({ createdAt: 1 });
    res.json(moves);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
