import { JwtPayload } from '../../helpers/jwt.helper';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
    interface Response {
      // Add your custom response properties here
      // Example: customData?: any;
    }
  }
}
import { JwtPayload } from '../../helpers/jwt.helper';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
