import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    role: string;
    employeeId: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      uid: decoded.uid,
      role: decoded.role,
      employeeId: decoded.employeeId
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
    return;
  }
};

export const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (req.user.role !== role) {
      res.status(403).json({ message: 'Forbidden: Insufficient role' });
      return;
    }
    next();
  };
};
