import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import { verifyAccessToken } from '../auth/tokens';

// Helper function to get user from token
const getUserFromToken = (req: Request) => {
  // Try Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload || !payload.sub) {
      throw new Error('Invalid token');
    }
    
    return payload.sub;
  }
  
  // Try cookie as fallback
  const token = req.cookies?.access_token;
  if (!token) {
    throw new Error('No access token provided');
  }
  
  const payload = verifyAccessToken(token);
  
  if (!payload || !payload.sub) {
    throw new Error('Invalid token');
  }
  
  return payload.sub;
};

// Switch to test account
export const switchToTestAccount = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });
    
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Find test account
    const testUser = await prisma.user.findUnique({
      where: { email: 'skallerup+4@gmail.com' },
      select: { id: true, email: true, name: true }
    });
    
    if (!testUser) {
      return res.status(404).json({ error: 'Test account not found' });
    }
    
    // Generate new access token for test user
    const { signAccessToken } = await import('../auth/tokens');
    const accessToken = signAccessToken(testUser.id, testUser.email);
    
    // Set cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.json({
      message: 'Switched to test account',
      user: testUser
    });
    
  } catch (error: any) {
    console.error('Error switching to test account:', error);
    res.status(500).json({ error: error.message });
  }
};

// Switch back to admin
export const switchToAdmin = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    
    // Check if current user is test account
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    if (currentUser?.email !== 'skallerup+4@gmail.com') {
      return res.status(403).json({ error: 'Must be on test account to switch back' });
    }
    
    // Find admin account
    const adminUser = await prisma.user.findUnique({
      where: { email: 'skallerup+3@gmail.com' },
      select: { id: true, email: true, name: true }
    });
    
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin account not found' });
    }
    
    // Generate new access token for admin user
    const { signAccessToken } = await import('../auth/tokens');
    const accessToken = signAccessToken(adminUser.id, adminUser.email);
    
    // Set cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.json({
      message: 'Switched back to admin account',
      user: adminUser
    });
    
  } catch (error: any) {
    console.error('Error switching to admin:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get current user info
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        isAdmin: true 
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
    
  } catch (error: any) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: error.message });
  }
};
