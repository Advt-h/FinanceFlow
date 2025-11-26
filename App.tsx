
import React, { useState } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Categories from './components/Categories';
import AddExpense from './components/AddExpense';
import Settings from './components/Settings';
import Login from './components/Login';
import Register from './components/Register';
import { Category, Expense, Page, Budget } from './types';
import { loadExpenses, loadCategories, loadBudgets, addExpense, addCategory, setMonthlyBudget, deleteCategoryAndExpenses, deleteExpense, auth, db } from './services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

// Main Layout Component
const MainLayout: React.FC<{ children: React.ReactNode, currentPage: Page, onNavigate: (p: Page) => void, onLogout: () => void }> = ({ children, currentPage, onNavigate, onLogout }) => {
  return (
    <div className="flex min-h-screen bg-[#0D0F12] text-[#E5E7EB]">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="flex-1 ml-64 p-10 overflow-y-auto h-screen custom-scrollbar bg-[#0D0F12] text-[#E5E7EB]">
        {children}
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
    // Delete a single expense
    const handleDeleteExpense = async (expenseId: string) => {
      await deleteExpense(expenseId);
      const updatedExpenses = await loadExpenses();
      setExpenses(updatedExpenses);
    };
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
    // Real-time Firestore listeners for expenses and categories
    React.useEffect(() => {
      if (!auth.currentUser) return;
      const uid = auth.currentUser.uid;
      // Expenses listener
      const expUnsub = onSnapshot(
        collection(db, `users/${uid}/expenses`),
        (snapshot) => {
          setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
        }
      );
      // Categories listener
      const catUnsub = onSnapshot(
        collection(db, `users/${uid}/categories`),
        (snapshot) => {
          setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
        }
      );
      return () => {
        expUnsub();
        catUnsub();
      };
    }, [auth.currentUser]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(2000);
  const [currency, setCurrency] = useState('USD');
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to get currency symbol
  const getCurrencySymbol = (code: string) => {
    switch(code) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'INR': return '₹';
      default: return '$';
    }
  };

  const currencySymbol = getCurrencySymbol(currency);

  const getCurrentPage = (): Page => {
    const path = location.pathname;
    if (path.includes('dashboard')) return Page.DASHBOARD;
    if (path.includes('categories')) return Page.CATEGORIES;
    if (path.includes('add-expense')) return Page.ADD_EXPENSE;
    if (path.includes('settings')) return Page.SETTINGS;
    if (path.includes('register')) return Page.REGISTER;
    return Page.LOGIN;
  };

  const handleNavigate = (page: Page) => {
    switch(page) {
      case Page.DASHBOARD: navigate('/dashboard'); break;
      case Page.CATEGORIES: navigate('/categories'); break;
      case Page.ADD_EXPENSE: navigate('/add-expense'); break;
      case Page.SETTINGS: navigate('/settings'); break;
      case Page.LOGIN: navigate('/login'); break;
      case Page.REGISTER: navigate('/register'); break;
    }
  };

  const handleAddExpense = async (newExpenseData: Omit<Expense, 'id'>) => {
    await addExpense(newExpenseData.amount, newExpenseData.category, new Date(newExpenseData.date), newExpenseData.description);
    const updatedExpenses = await loadExpenses();
    setExpenses(updatedExpenses);
    navigate('/dashboard');
  };

  const handleAddCategory = async (name: string, color: string) => {
    await addCategory(name, color);
    const updatedCategories = await loadCategories();
    setCategories(updatedCategories);
  };

  // Delete category and all its expenses in Firestore
  const handleDeleteCategory = async (id: string) => {
    const deletedCategory = categories.find(c => c.id === id);
    if (!deletedCategory) return;
    await deleteCategoryAndExpenses(deletedCategory.name);
    const updatedCategories = await loadCategories();
    setCategories(updatedCategories);
    const updatedExpenses = await loadExpenses();
    setExpenses(updatedExpenses);
  };


  // Load user data after login/register
  const handleUserLoaded = async () => {
    const [exp, cat, bud] = await Promise.all([
      loadExpenses(),
      loadCategories(),
      loadBudgets()
    ]);
    setExpenses(exp);
    setCategories(cat);
    const budgets = bud as Budget[];
    if (budgets.length > 0 && typeof budgets[0].limit === 'number') setMonthlyBudget(budgets[0].limit);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={async () => { await handleUserLoaded(); handleNavigate(Page.DASHBOARD); }} onNavigate={handleNavigate} />} />
      <Route path="/register" element={<Register onLogin={async () => { await handleUserLoaded(); handleNavigate(Page.DASHBOARD); }} onNavigate={handleNavigate} />} />
      <Route path="/dashboard" element={
        <MainLayout currentPage={Page.DASHBOARD} onNavigate={handleNavigate} onLogout={() => handleNavigate(Page.LOGIN)}>
          <Dashboard 
            categories={categories} 
            expenses={expenses} 
            monthlyBudget={monthlyBudget}
            onNavigate={handleNavigate} 
            currencySymbol={currencySymbol}
            onDeleteExpense={handleDeleteExpense}
          />
        </MainLayout>
      } />
      <Route path="/categories" element={
        <MainLayout currentPage={Page.CATEGORIES} onNavigate={handleNavigate} onLogout={() => handleNavigate(Page.LOGIN)}>
          <Categories 
            categories={categories}
            expenses={expenses}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            currencySymbol={currencySymbol}
          />
        </MainLayout>
      } />
      <Route path="/add-expense" element={
        <MainLayout currentPage={Page.ADD_EXPENSE} onNavigate={handleNavigate} onLogout={() => handleNavigate(Page.LOGIN)}>
          <AddExpense 
            categories={categories} 
            onAddExpense={handleAddExpense} 
            onCancel={() => navigate('/dashboard')} 
            currencySymbol={currencySymbol}
          />
        </MainLayout>
      } />
      <Route path="/settings" element={
        <MainLayout currentPage={Page.SETTINGS} onNavigate={handleNavigate} onLogout={() => handleNavigate(Page.LOGIN)}>
          <Settings 
            monthlyBudget={monthlyBudget} 
            setMonthlyBudget={setMonthlyBudget} 
            currency={currency}
            setCurrency={setCurrency}
          />
        </MainLayout>
      } />
      <Route path="*" element={<Login onLogin={async () => { await handleUserLoaded(); handleNavigate(Page.DASHBOARD); }} onNavigate={handleNavigate} />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
