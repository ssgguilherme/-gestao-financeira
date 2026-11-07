import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authenticateJWT } from './server/middleware/auth';
import {
  registerUser,
  loginUser,
  loginDemoUser,
  getMe,
  updateProfile
} from './server/controllers/authController';
import { getDashboardData } from './server/controllers/dashboardController';
import {
  getTransactions,
  createTransaction,
  deleteTransaction
} from './server/controllers/transactionsController';
import {
  getAccounts,
  createAccount,
  getCards,
  createCard
} from './server/controllers/accountsController';
import {
  getInvestments,
  createInvestment
} from './server/controllers/investmentsController';
import {
  getGoals,
  createGoal,
  updateGoalDeposit,
  getBudgets,
  createBudget
} from './server/controllers/goalsController';
import {
  getPixKeys,
  createPixKey,
  transferPix
} from './server/controllers/pixController';
import {
  exportUserBackup,
  restoreUserBackup,
  exportCsvReport,
  getReportsSummary
} from './server/controllers/reportsController';

// In-Memory Rate Limiter para rotas de autenticação (Prevenção de Força Bruta - OWASP A07)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

function authRateLimiter(maxRequests = 20, windowMs = 60000) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      const waitSeconds = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        error: 'Muitas tentativas de autenticação',
        message: `Limite de tentativas excedido por segurança. Tente novamente em ${waitSeconds} segundos.`
      });
    }

    record.count++;
    next();
  };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Body parser com limite seguro
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // --- CABEÇALHOS DE SEGURANÇA OWASP (A05: Security Misconfiguration) ---
  app.use((req, res, next) => {
    // Evita MIME-sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Previne Clickjacking (permite iframe somente no mesmo domínio do AI Studio se necessário)
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // Proteção de Referrer
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Filtro XSS legado em navegadores compatíveis
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // CORS: Restringe métodos e cabeçalhos permitidos
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'FinanFlow API - Gestão Financeira Segura',
      owaspCompliance: 'active',
      timestamp: new Date().toISOString()
    });
  });

  // --- ROTAS DE AUTENTICAÇÃO (com Rate Limiting) ---
  app.post('/api/auth/register', authRateLimiter(15, 60000), registerUser);
  app.post('/api/auth/login', authRateLimiter(20, 60000), loginUser);
  app.post('/api/auth/demo', loginDemoUser);
  app.get('/api/auth/me', authenticateJWT, getMe);
  app.put('/api/auth/profile', authenticateJWT, updateProfile);

  // --- DASHBOARD & MÉTRICAS ---
  app.get('/api/dashboard', authenticateJWT, getDashboardData);

  // --- TRANSAÇÕES (CRUD com IDOR check) ---
  app.get('/api/transactions', authenticateJWT, getTransactions);
  app.post('/api/transactions', authenticateJWT, createTransaction);
  app.delete('/api/transactions/:id', authenticateJWT, deleteTransaction);

  // --- CONTAS & CARTÕES ---
  app.get('/api/accounts', authenticateJWT, getAccounts);
  app.post('/api/accounts', authenticateJWT, createAccount);
  app.get('/api/cards', authenticateJWT, getCards);
  app.post('/api/cards', authenticateJWT, createCard);

  // --- INVESTIMENTOS ---
  app.get('/api/investments', authenticateJWT, getInvestments);
  app.post('/api/investments', authenticateJWT, createInvestment);

  // --- METAS & ORÇAMENTOS ---
  app.get('/api/goals', authenticateJWT, getGoals);
  app.post('/api/goals', authenticateJWT, createGoal);
  app.post('/api/goals/:id/deposit', authenticateJWT, updateGoalDeposit);
  app.get('/api/budgets', authenticateJWT, getBudgets);
  app.post('/api/budgets', authenticateJWT, createBudget);

  // --- ÁREA PIX ---
  app.get('/api/pix/keys', authenticateJWT, getPixKeys);
  app.post('/api/pix/keys', authenticateJWT, createPixKey);
  app.post('/api/pix/transfer', authenticateJWT, transferPix);

  // --- RELATÓRIOS, BACKUP & RESTORE SEGURO (OWASP A01 & A03) ---
  app.get('/api/reports/backup', authenticateJWT, exportUserBackup);
  app.post('/api/reports/restore', authenticateJWT, restoreUserBackup);
  app.get('/api/reports/export/csv', authenticateJWT, exportCsvReport);
  app.get('/api/reports/summary', authenticateJWT, getReportsSummary);

  // Vite middleware for development vs Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    // Previne que navegadores fiquem presos em cache de index.html ou sw.js após publish
    app.use((req, res, next) => {
      if (req.path === '/' || req.path === '/index.html' || req.path === '/sw.js') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      next();
    });
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FinanFlow Server rodando na porta ${PORT}`);
  });
}

startServer();
