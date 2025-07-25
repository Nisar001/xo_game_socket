import { Router } from 'express';
import { registerController } from '../controllers/register.controller';
import { loginController } from '../controllers/login.controller';
import { getProfileController } from '../controllers/getProfile.controller';
import { jwtVerifyMiddleware } from '../../../middlewares/jwtVerify.middleware';

const router = Router();

// Register
router.post('/register', registerController);

// Login
router.post('/login', loginController);

// Get profile (protected)
router.get('/profile', jwtVerifyMiddleware, getProfileController);

export default router;
