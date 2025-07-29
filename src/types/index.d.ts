import { JwtPayload } from '../helpers/jwt.helper';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
