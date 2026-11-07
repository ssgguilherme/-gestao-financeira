import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { store, User } from '../db/store';

// Gera um segredo criptograficamente aleatório em memória caso JWT_SECRET não esteja configurado
// Isso impede o uso da chave estática pública 'finance_super_secret_jwt_key_2026'
const RUNTIME_JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: User;
}

export function generateToken(user: { id: string; email: string }): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    RUNTIME_JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Acesso não autorizado',
      message: 'Token de autenticação não fornecido ou formato inválido.'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, RUNTIME_JWT_SECRET) as { userId: string; email: string };
    
    // Valida se o usuário ainda existe no armazenamento
    const user = store.findUserById(decoded.userId);
    if (!user) {
      res.status(401).json({
        error: 'Sessão inválida',
        message: 'Usuário não encontrado ou removido do sistema.'
      });
      return;
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Sessão expirada',
        message: 'Seu token de autenticação expirou. Faça login novamente.'
      });
      return;
    }

    res.status(401).json({
      error: 'Token inválido',
      message: 'Token de autenticação corrompido ou assinatura forjada.'
    });
  }
}
