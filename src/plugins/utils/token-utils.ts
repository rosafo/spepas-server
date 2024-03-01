import { sign } from 'jsonwebtoken';
import 'dotenv/config';

/**
 * Generates jwt token for user to access the system(if only user exists).
 * Returns the access token.
 * @param userId - The user Id from client.
 */
export const createToken = (userId: string): string => {
  const accessToken: string = sign({ id: userId }, process.env.JWT_SECRET || '', {
    expiresIn: '1d',
  });
  return accessToken;
};

/**
 * Generates jwt token for user to verify their account during the creation process.
 * Returns the temporary access token.
 * @param userId - The user Id from client.
 */
export const createTemporalToken = (userId: string): string => {
  const accessToken: string = sign({ id: userId }, process.env.JWT_SECRET || '', {
    expiresIn: '10m', 
  });
  return accessToken;
};


