import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Category } from '../../src/types.js';

export const getCategories = (req: AuthenticatedRequest, res: Response) => {
  const data = dbStore.getData();
  let userCategories = data.categories.filter((c) => c.userId === req.userId);

  if (userCategories.length === 0 && req.userId) {
    const defaultCategories: Category[] = [
      { id: `cat_${Date.now()}_1`, userId: req.userId, name: 'Mercado', type: 'despesa', color: '#22C55E', icon: 'ShoppingCart', budgetLimit: 1200 },
      { id: `cat_${Date.now()}_2`, userId: req.userId, name: 'Combustível', type: 'despesa', color: '#F59E0B', icon: 'Fuel', budgetLimit: 600 },
      { id: `cat_${Date.now()}_3`, userId: req.userId, name: 'Aluguel & Casa', type: 'despesa', color: '#EF4444', icon: 'Home', budgetLimit: 2200 },
      { id: `cat_${Date.now()}_4`, userId: req.userId, name: 'Lazer & Restaurante', type: 'despesa', color: '#EC4899', icon: 'Utensils', budgetLimit: 500 },
      { id: `cat_${Date.now()}_5`, userId: req.userId, name: 'Academia & Saúde', type: 'despesa', color: '#06B6D4', icon: 'Activity', budgetLimit: 300 },
      { id: `cat_${Date.now()}_6`, userId: req.userId, name: 'Streaming & Tech', type: 'despesa', color: '#8B5CF6', icon: 'Tv', budgetLimit: 200 },
      { id: `cat_${Date.now()}_7`, userId: req.userId, name: 'Salário & Renda', type: 'receita', color: '#10B981', icon: 'Briefcase' },
      { id: `cat_${Date.now()}_8`, userId: req.userId, name: 'Freelancer', type: 'receita', color: '#3B82F6', icon: 'Code' },
      { id: `cat_${Date.now()}_9`, userId: req.userId, name: 'Investimentos', type: 'ambos', color: '#6366F1', icon: 'TrendingUp' },
      { id: `cat_${Date.now()}_10`, userId: req.userId, name: 'Outros', type: 'ambos', color: '#64748B', icon: 'HelpCircle' }
    ];

    dbStore.updateData((db) => {
      db.categories.push(...defaultCategories);
    });
    userCategories = defaultCategories;
  }

  return res.json(userCategories);
};

export const createCategory = (req: AuthenticatedRequest, res: Response) => {
  const { name, type, color, icon, budgetLimit } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
  }

  const newCat: Category = {
    id: `cat_${Date.now()}`,
    userId: req.userId!,
    name,
    type: type || 'despesa',
    color: color || '#3B82F6',
    icon: icon || 'Tag',
    budgetLimit: budgetLimit ? Number(budgetLimit) : undefined
  };

  dbStore.updateData((db) => {
    db.categories.push(newCat);
  });

  return res.status(201).json(newCat);
};

export const updateCategory = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, type, color, icon, budgetLimit } = req.body;

  let updated: Category | null = null;

  dbStore.updateData((db) => {
    const cat = db.categories.find((c) => c.id === id && c.userId === req.userId);
    if (cat) {
      if (name) cat.name = name;
      if (type) cat.type = type;
      if (color) cat.color = color;
      if (icon) cat.icon = icon;
      if (budgetLimit !== undefined) cat.budgetLimit = budgetLimit ? Number(budgetLimit) : undefined;
      updated = cat;
    }
  });

  if (!updated) {
    return res.status(404).json({ error: 'Categoria não encontrada.' });
  }

  return res.json(updated);
};

export const deleteCategory = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  let deleted = false;
  dbStore.updateData((db) => {
    const idx = db.categories.findIndex((c) => c.id === id && c.userId === req.userId);
    if (idx !== -1) {
      db.categories.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    return res.status(404).json({ error: 'Categoria não encontrada.' });
  }

  return res.json({ message: 'Categoria removida com sucesso.' });
};
