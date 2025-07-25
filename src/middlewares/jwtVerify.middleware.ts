import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../helpers/jwt.helper';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function jwtVerifyMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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
