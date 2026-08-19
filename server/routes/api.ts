import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  resetPasswordRequest
} from '../controllers/authController.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount
} from '../controllers/accountsController.js';
import {
  getCards,
  createCard,
  updateCard,
  deleteCard,
  payCardBill
} from '../controllers/cardsController.js';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionsController.js';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoriesController.js';
import {
  getFixedAccounts,
  createFixedAccount,
  updateFixedAccount,
  deleteFixedAccount,
  processFixedAccounts
} from '../controllers/fixedAccountsController.js';
import {
  getGoals,
  createGoal,
  depositGoal,
  deleteGoal
} from '../controllers/goalsController.js';
import {
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment
} from '../controllers/investmentsController.js';
import {
  getBudgets,
  setBudget,
  deleteBudget
} from '../controllers/budgetsController.js';
import {
  exportTransactionsCSV,
  exportDatabaseBackup,
  importTransactions,
  restoreDatabaseBackup
} from '../controllers/reportsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Auth routes (Public)
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.post('/auth/forgot-password', resetPasswordRequest);

// Protected routes (JWT required)
router.use(authMiddleware);

// User profile
router.get('/auth/profile', getProfile);
router.put('/auth/profile', updateProfile);
router.post('/auth/change-password', changePassword);

// Dashboard
router.get('/dashboard', getDashboardSummary);

// Bank Accounts
router.get('/accounts', getAccounts);
router.post('/accounts', createAccount);
router.put('/accounts/:id', updateAccount);
router.delete('/accounts/:id', deleteAccount);

// Credit Cards
router.get('/cards', getCards);
router.post('/cards', createCard);
router.put('/cards/:id', updateCard);
router.delete('/cards/:id', deleteCard);
router.post('/cards/:id/pay', payCardBill);

// Transactions
router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);
router.put('/transactions/:id', updateTransaction);
router.delete('/transactions/:id', deleteTransaction);

// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Fixed Accounts / Recurrent
router.get('/fixed-accounts', getFixedAccounts);
router.post('/fixed-accounts', createFixedAccount);
router.put('/fixed-accounts/:id', updateFixedAccount);
router.delete('/fixed-accounts/:id', deleteFixedAccount);
router.post('/fixed-accounts/process', processFixedAccounts);

// Goals
router.get('/goals', getGoals);
router.post('/goals', createGoal);
router.post('/goals/:id/deposit', depositGoal);
router.delete('/goals/:id', deleteGoal);

// Investments
router.get('/investments', getInvestments);
router.post('/investments', createInvestment);
router.put('/investments/:id', updateInvestment);
router.delete('/investments/:id', deleteInvestment);

// Budgets
router.get('/budgets', getBudgets);
router.post('/budgets', setBudget);
router.delete('/budgets/:id', deleteBudget);

// Reports & Imports/Exports
router.get('/reports/export-csv', exportTransactionsCSV);
router.get('/reports/backup', exportDatabaseBackup);
router.post('/reports/import', importTransactions);
router.post('/reports/restore', restoreDatabaseBackup);

export default router;
