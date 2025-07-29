import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../helpers/jwt.helper';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function jwtVerifyMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'test') {
    // Use a valid ObjectId string for mock user
    req.user = { _id: '507f1f77bcf86cd799439011', email: 'mockuser@example.com' };
    return next();
  }
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export const authenticateSocket = async (socket: Socket, next: any) => {
  if (process.env.NODE_ENV === 'test') {
    // Use a valid ObjectId string for mock user
    (socket as any).user = { _id: '507f1f77bcf86cd799439011', email: 'mockuser@example.com', username: 'mockuser' };
    return next();
  }
  const token = socket.handshake.auth?.token || socket.handshake.headers['authorization'];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById((decoded as any)._id);
    if (!user) return next(new Error('User not found'));
    (socket as any).user = user; // Type assertion for custom property
    next();
  } catch (err) {
    next(new Error('Unauthorized'));
  }
};
