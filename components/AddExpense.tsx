import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Category, Expense } from '../types';

interface AddExpenseProps {
  categories: Category[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
  currencySymbol: string;
}

const AddExpense: React.FC<AddExpenseProps> = ({ categories, onAddExpense, onCancel, currencySymbol }) => {
  const [amount, setAmount] = useState('');
  // Use Date object for react-datepicker
  const [date, setDate] = useState<Date>(new Date());
  const [category, setCategory] = useState(categories[0]?.name || '');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categories.length === 0) return;
    // Format date as YYYY-MM-DD string for storage
    const dateString = date instanceof Date && !isNaN(date.getTime())
      ? date.toISOString().split('T')[0]
      : '';
    onAddExpense({
      amount: parseFloat(amount),
      date: dateString,
      category,
      description: description || ''
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[600px] text-[#E5E7EB]">
      <div className="w-full max-w-xl bg-[#181A1F] rounded-2xl shadow-xl border border-[#23262b] overflow-hidden">
        <div className="px-8 py-6 border-b border-[#23262b] bg-[#23262b]/50">
          <h2 className="text-xl font-bold text-[#E5E7EB]">Add New Expense</h2>
          <p className="text-[#A1A1AA] text-sm mt-1">Enter the details of your transaction</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-1 space-y-2">
               <label className="block text-sm font-semibold text-slate-300">Amount</label>
               <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] font-medium">{currencySymbol}</span>
                 <input 
                    type="number" 
                    step="0.01" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-[#E5E7EB] font-medium placeholder-[#A1A1AA]"
                    placeholder="0.00"
                  />
               </div>
            </div>
            <div className="col-span-1 space-y-2">
              <label className="block text-sm font-semibold text-slate-300">Date</label>
              <DatePicker
                selected={date}
                onChange={(d: Date) => setDate(d)}
                maxDate={new Date()}
                dateFormat="yyyy-MM-dd"
                className="w-full px-4 py-2.5 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-[#E5E7EB] color-scheme-dark"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Category</label>
            <div className="relative">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-[#E5E7EB] appearance-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Description <span className="text-slate-500 font-normal">(optional)</span></label>
            <textarea 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-[#E5E7EB] resize-none placeholder-[#A1A1AA]"
              placeholder="What was this expense for? (optional)"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-6 py-2.5 text-[#A1A1AA] font-medium hover:bg-[#23262b] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={categories.length === 0}
              className={`px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-[#E5E7EB] font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95 ${categories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;