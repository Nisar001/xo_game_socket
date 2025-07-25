import express from 'express';
import authRoutes from './modules/auth/routes/auth.routes';
import e from 'express';

const appRoutes = express.Router();

// Authentication routes
appRoutes.use('/auth', authRoutes);

export default appRoutes;