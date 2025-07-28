import { Router } from 'express';
import { getAllGames, getGameById, deleteGameById, createGameRoom } from '../controllers/game.controller';
import { jwtVerifyMiddleware } from '../../../middlewares/jwtVerify.middleware';

const router = Router();


// POST /api/xogame/games
router.post('/games', createGameRoom);

// GET /api/xogame/games?page=1&limit=10
router.get('/games', jwtVerifyMiddleware, getAllGames);

// GET /api/xogame/games/:id
router.get('/games/:id', jwtVerifyMiddleware, getGameById);

// DELETE /api/xogame/games/:id
router.delete('/games/:id', jwtVerifyMiddleware, deleteGameById);

export default router;
