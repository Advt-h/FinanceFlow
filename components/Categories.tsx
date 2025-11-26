import React, { useState } from 'react';
import { Plus, Trash2, X, Check } from 'lucide-react';
import { Category } from '../types';
import { CATEGORY_COLORS } from '../constants';

import { Expense } from '../types';

interface CategoriesProps {
  categories: Category[];
  expenses: Expense[];
  onAddCategory: (name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  currencySymbol: string;
}

const Categories: React.FC<CategoriesProps> = ({ categories, expenses, onAddCategory, onDeleteCategory, currencySymbol }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName) {
      onAddCategory(newCategoryName, newCategoryColor);
      setNewCategoryName('');
      setNewCategoryColor(CATEGORY_COLORS[0]);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto relative text-[#E5E7EB]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#E5E7EB]">Categories</h2>
          <p className="text-[#A1A1AA] mt-1">Manage your spending categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Add Category Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group border-2 border-dashed border-[#23262b] rounded-2xl p-6 flex flex-col items-center justify-center text-[#A1A1AA] hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all duration-200 h-40"
        >
          <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center mb-3 transition-colors text-slate-400 group-hover:text-indigo-400">
             <Plus size={24} />
          </div>
          <span className="font-medium">Add New Category</span>
        </button>

        {/* Category Cards */}
        {categories.map((cat) => {
          const totalSpent = expenses
            .filter(e => e.category === cat.name)
            .reduce((sum, e) => sum + e.amount, 0);
          return (
            <div key={cat.id} className="bg-[#181A1F] rounded-2xl p-6 shadow-md border border-[#23262b] flex flex-col justify-between h-40 hover:border-[#3B3B3B] transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full -mr-8 -mt-8" />
              <button 
                onClick={() => onDeleteCategory(cat.id)}
                className="absolute top-4 right-4 z-10 text-[#A1A1AA] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-[#23262b]/50 p-1 rounded-full"
                title="Delete Category"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-10 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)]" 
                  style={{ backgroundColor: cat.color, boxShadow: `0 0 20px ${cat.color}40` }} 
                />
                <div>
                   <h3 className="font-bold text-[#E5E7EB] text-lg leading-tight">{cat.name}</h3>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#A1A1AA] font-medium uppercase mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-[#E5E7EB] tracking-tight">{currencySymbol}{totalSpent.toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181A1F] rounded-2xl shadow-2xl border border-[#23262b] w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[#23262b] flex justify-between items-center">
              <h3 className="font-bold text-[#E5E7EB] text-lg">Add Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A1A1AA] hover:text-[#E5E7EB]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#A1A1AA]">Name</label>
                <input 
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-[#E5E7EB] placeholder-[#A1A1AA]"
                  placeholder="e.g., Entertainment"
                />
              </div>
              
              <div className="space-y-3">
                 <label className="block text-sm font-medium text-[#A1A1AA]">Color Code</label>
                 <div className="grid grid-cols-6 gap-3">
                   {CATEGORY_COLORS.map(color => (
                     <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategoryColor(color)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${newCategoryColor === color ? 'ring-2 ring-[#E5E7EB] ring-offset-2 ring-offset-[#181A1F] scale-110' : ''}`}
                        style={{ backgroundColor: color }}
                     >
                        {newCategoryColor === color && <Check size={16} className="text-[#E5E7EB] drop-shadow-md" />}
                     </button>
                   ))}
                 </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-[#A1A1AA] font-medium hover:bg-[#23262b] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-[#E5E7EB] font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;