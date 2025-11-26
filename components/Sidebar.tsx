import React from 'react';
import { LayoutDashboard, Grid, PlusCircle, Settings, LogOut } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onLogout }) => {
  const navItems = [
    { page: Page.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { page: Page.CATEGORIES, icon: Grid, label: 'Categories' },
    { page: Page.ADD_EXPENSE, icon: PlusCircle, label: 'Add Expense' },
    { page: Page.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-[#0D0F12] h-screen fixed left-0 top-0 border-r border-[#23262b] flex flex-col shadow-lg z-10">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-500/20 shadow-lg">
          <span className="text-[#E5E7EB] font-bold text-xl">F</span>
        </div>
        <h1 className="text-xl font-bold text-[#E5E7EB] tracking-tight">FinanceFlow</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                ${isActive 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                  : 'text-[#A1A1AA] hover:bg-[#181A1F] hover:text-[#E5E7EB]'
                }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#23262b]">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#A1A1AA] hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 font-medium text-sm"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;