import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type jwtProtectType = (req: Request, res: Response, next: NextFunction) => void;

function jwtProtect(secret: string): jwtProtectType {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!secret) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'falta el header Authorization: Bearer <token>' });
    }

    const token = authHeader.slice('Bearer '.length);
    jwt.verify(token, secret, (err) => {
      if (err) {
        return res.status(401).json({ error: 'token inválido o expirado' });
      }
      return next();
    });
  };
}

export default jwtProtect;