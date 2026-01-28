import { validateUserToken } from '../utils/token.js';
import type {Request,Response,NextFunction} from 'express'


export function authenticationMiddleware(req:Request, res:Response, next:NextFunction) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return next();

  if (!authHeader.startsWith('Bearer'))
    return res
      .status(400)
      .json({ error: 'Authorization header must start with Bearer' });

  const [_, token] = authHeader.split(' ');

  const payload = validateUserToken(token);

  req.user = payload;
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