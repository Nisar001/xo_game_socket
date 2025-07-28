import { Request, Response } from 'express';
import { GameRoom } from '../../../models/gameRoom.model';

// Get all games with pagination
export const getAllGames = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      GameRoom.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      GameRoom.countDocuments()
    ]);

    res.json({
    total,
      page,
      totalPages: Math.ceil(total / limit),
      results: games,
      
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get a single game by ID
export const getGameById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const game = await GameRoom.findById(id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// (Optional) Delete a game by ID
export const deleteGameById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const game = await GameRoom.findByIdAndDelete(id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json({ message: 'Game deleted', game });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
