import type { Request, Response, NextFunction } from "express";

export interface ReplitUser {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
  url?: string;
  roles?: string;
}

export function getReplitUser(req: Request): ReplitUser | null {
  const userId = req.headers['x-replit-user-id'] as string;
  const userName = req.headers['x-replit-user-name'] as string;
  const userRoles = req.headers['x-replit-user-roles'] as string;
  const userEmail = req.headers['x-replit-user-email'] as string;
  const userProfileImage = req.headers['x-replit-user-profile-image'] as string;
  const userUrl = req.headers['x-replit-user-url'] as string;

  if (!userId || !userName) {
    return null;
  }

  return {
    id: userId,
    name: userName,
    email: userEmail,
    profileImage: userProfileImage,
    url: userUrl,
    roles: userRoles
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getReplitUser(req);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  (req as any).user = user;
  next();
}
