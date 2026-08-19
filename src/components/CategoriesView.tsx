import React, { useState } from 'react';
import { Tags, Plus, ShoppingCart, Fuel, Home, Utensils, Activity, Tv, Briefcase, Code, TrendingUp, HelpCircle } from 'lucide-react';
import { Category } from '../types';

interface CategoriesViewProps {
  categories: Category[];
  onOpenNewCategory: () => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ categories = [], onOpenNewCategory }) => {
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Categorização
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-2">Categorias de Lançamento</h1>
          <p className="text-xs text-slate-400">
            Organize suas contas e defina limites de orçamento por categoria.
          </p>
        </div>
        <button
          onClick={onOpenNewCategory}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {safeCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between hover:border-slate-700 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                style={{ backgroundColor: cat.color || '#3B82F6' }}
              >
                <Tags className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">{cat.name}</h3>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">{cat.type}</span>
              </div>
            </div>

            {cat.budgetLimit && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Teto do Mês</span>
                <span className="text-xs font-bold text-emerald-400">R$ {cat.budgetLimit.toFixed(2)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
