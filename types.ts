export interface Budget {
  id: string;
  month: string;
  limit: number;
  spent: number;
}
export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  totalSpent: number;
}

export enum Page {
  DASHBOARD = 'DASHBOARD',
  CATEGORIES = 'CATEGORIES',
  ADD_EXPENSE = 'ADD_EXPENSE',
  SETTINGS = 'SETTINGS',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER'
}

export interface User {
  username: string;
  email: string;
  name: string;
}