import { verify } from 'jsonwebtoken';
import prisma from './db';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function verifyToken(token: string): Promise<DecodedToken | null> {
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as DecodedToken;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function checkPremiumStatus(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user || !user.subscription) {
      return false;
    }

    const now = new Date();
    return user.subscription.isActive && user.subscription.endDate > now;
  } catch (error) {
    console.error('Erro ao verificar status premium:', error);
    return false;
  }
}

export async function verifyAuth(token: string): Promise<boolean> {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return false;
  }
} 