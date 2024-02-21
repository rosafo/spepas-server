// auth.middleware.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';
import 'dotenv/config';

@Injectable()
@Injectable()
export class AuthMiddleware {
  verifyToken(headers: Record<string, string | string[]>): { id: string } {
    let token: string | undefined;
    if (typeof headers['x-access-token'] === 'string') {
      token = headers['x-access-token'];
    } else if (Array.isArray(headers['authorization'])) {
      token = headers['authorization'][0];
    } else if (typeof headers['authorization'] === 'string') {
      token = headers['authorization'];
    }

    if (!token) {
      throw new UnauthorizedException('Unauthorized: Token missing');
    }

    try {
      const decodedToken = verify(
        token,
        process.env.JWT_SECRET!
      ) as { id: string };
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized: Invalid token');
    }
  }
}

