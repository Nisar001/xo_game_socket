import { Router } from 'express';
import { getAllMoves, getUserMoves, getMatchMoves, getUserMatchMoves } from '../controllers/move.controller';

const router = Router();

// GET /api/xogame/moves?page=1&limit=20
router.get('/moves', getAllMoves);

// GET /api/xogame/moves/user/:userId
router.get('/moves/user/:userId', getUserMoves);

// GET /api/xogame/moves/match/:roomId
router.get('/moves/match/:roomId', getMatchMoves);

// GET /api/xogame/moves/user/:userId/match/:roomId
router.get('/moves/user/:userId/match/:roomId', getUserMatchMoves);

export default router;
