
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { verify } from 'jsonwebtoken';
import 'dotenv/config';
@Injectable()

export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token =
      req.headers.authorization?.split(' ')[1] || (req.query.token as string);
    if (token) {
      try {
        const decodedToken = verify(
          token,
          process.env.JWT_SECRET!
        ) as unknown as { id: string }; 
        (req as any)['user'] = decodedToken; 
        next();
      } catch (error) {
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }
    } else {
      res.status(401).json({ message: 'Unauthorized: Token missing' });
    }
  }
}


