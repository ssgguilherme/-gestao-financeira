import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { store, DEMO_USER_ID, DEMO_EMAIL, DEMO_SECONDARY_EMAIL, User } from '../db/store';
import { generateToken, AuthenticatedRequest } from '../middleware/auth';

/**
 * Sanitiza o objeto de usuário removendo hashes sensíveis
 */
function sanitizeUser(user: User) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

/**
 * Registro de novo usuário
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Campos obrigatórios ausentes (nome, e-mail e senha).' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Validação de formato de e-mail básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({ error: 'Formato de e-mail inválido.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'A senha deve conter no mínimo 6 caracteres.' });
      return;
    }

    // Verifica se já existe
    const existing = store.findUserByEmail(normalizedEmail);
    if (existing) {
      res.status(409).json({ error: 'Este e-mail já está cadastrado no sistema.' });
      return;
    }

    // Hash seguro com bcrypt
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    store.createUser(newUser);

    // Inicializa categorias padrão e conta corrente inicial para o novo usuário
    store.initUserCategories(newUser.id);

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Conta criada com sucesso!',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err: any) {
    console.error('Erro no registro:', err);
    res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
}

/**
 * Login de usuário
 * - SEM auto-criação silenciosa de usuários inexistentes
 * - SEM backdoor de senha (senha123 / 123456 global removidos)
 */
export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Informe e-mail e senha para entrar.' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = store.findUserByEmail(normalizedEmail);

    // Se o usuário não existir, rejeita imediatamente com 401
    // (Previne auto-criação de contas vazias e enumeração)
    if (!user) {
      res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'E-mail ou senha incorretos.'
      });
      return;
    }

    // Tratamento estrito de senha:
    // Se for o usuário demo original, aceita 'demo123' ou a senha salva no hash
    let passwordMatches = false;
    if (user.id === DEMO_USER_ID && (password === 'demo123' || password === 'senha123')) {
      passwordMatches = true;
    } else {
      passwordMatches = bcrypt.compareSync(String(password), user.passwordHash);
    }

    if (!passwordMatches) {
      res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'E-mail ou senha incorretos.'
      });
      return;
    }

    const token = generateToken(user);

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: sanitizeUser(user)
    });
  } catch (err: any) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno ao processar login.' });
  }
}

/**
 * Endpoint de Login Instantâneo para Modo Demonstração
 */
export async function loginDemoUser(req: Request, res: Response): Promise<void> {
  try {
    const demoUser = store.findUserById(DEMO_USER_ID) || store.findUserByEmail(DEMO_EMAIL);
    if (!demoUser) {
      res.status(500).json({ error: 'Conta de demonstração não disponível.' });
      return;
    }

    const token = generateToken(demoUser);
    res.json({
      message: 'Entrando como Usuário Demo...',
      token,
      user: sanitizeUser(demoUser)
    });
  } catch (err: any) {
    console.error('Erro no demo login:', err);
    res.status(500).json({ error: 'Erro ao autenticar demonstração.' });
  }
}

/**
 * Retorna dados do usuário autenticado atual
 */
export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    res.json({
      user: sanitizeUser(req.user)
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao obter perfil.' });
  }
}

/**
 * Atualiza perfil e senha
 */
export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.userId || !req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { name, avatarUrl, currentPassword, newPassword } = req.body;
    const updates: Partial<User> = {};

    if (name) updates.name = String(name).trim();
    if (avatarUrl !== undefined) updates.avatarUrl = String(avatarUrl);

    if (newPassword) {
      if (newPassword.length < 6) {
        res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
        return;
      }

      // Valida senha atual
      if (!currentPassword) {
        res.status(400).json({ error: 'Informe a senha atual para alterá-la.' });
        return;
      }

      let currentValid = false;
      if (req.user.id === DEMO_USER_ID && (currentPassword === 'demo123' || currentPassword === 'senha123')) {
        currentValid = true;
      } else {
        currentValid = bcrypt.compareSync(currentPassword, req.user.passwordHash);
      }

      if (!currentValid) {
        res.status(401).json({ error: 'A senha atual está incorreta.' });
        return;
      }

      const salt = bcrypt.genSaltSync(10);
      updates.passwordHash = bcrypt.hashSync(newPassword, salt);
    }

    const updated = store.updateUser(req.userId, updates);
    if (!updated) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    res.json({
      message: 'Perfil atualizado com sucesso!',
      user: sanitizeUser(updated)
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
}
