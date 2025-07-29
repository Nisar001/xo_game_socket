import express from 'express';
import authRoutes from './modules/auth/routes/auth.routes';
import xogameRoutes from './modules/xogame/routes/game.routes';
import moveRoutes from './modules/xogame/routes/move.routes';
import e from 'express';

const appRoutes = express.Router();

// Authentication routes

// XOGAME routes
appRoutes.use('/auth', authRoutes);
appRoutes.use('/xogame', xogameRoutes);
appRoutes.use('/xogame', moveRoutes);


export default appRoutes;