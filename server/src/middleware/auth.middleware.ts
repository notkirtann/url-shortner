import { validateUserToken } from '../utils/token.ts';
import type {Request,Response,NextFunction} from 'express'

export function authenticationMiddleware(req:Request, res:Response, next:NextFunction) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return next();

  if (!authHeader.startsWith('Bearer'))
    return res.status(400).json({ error: 'Authorization header must start with Bearer' });

  const [_, token] = authHeader.split(' ');

  const payload = validateUserToken(token);

  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  
  req.user = payload as { id: string; iat?: number };
  next();
}


export function ensureAuthenticated(req:Request, res:Response, next:NextFunction) {
  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ error: 'You must be logged in to access this resource' });
  }
  next();
}