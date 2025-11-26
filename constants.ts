import { Category, Expense } from "./types";

export const CATEGORY_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
  '#64748B', // Slate
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', color: '#EF4444', totalSpent: 450.50 },
  { id: '2', name: 'Travel', color: '#06B6D4', totalSpent: 120.00 },
  { id: '3', name: 'Bills & Utilities', color: '#F59E0B', totalSpent: 230.75 },
  { id: '4', name: 'Shopping', color: '#EC4899', totalSpent: 560.20 },
  { id: '5', name: 'Transportation', color: '#8B5CF6', totalSpent: 85.00 },
  { id: '6', name: 'Health', color: '#10B981', totalSpent: 45.00 },
  { id: '7', name: 'Rent', color: '#3B82F6', totalSpent: 1200.00 },
  { id: '8', name: 'Misc', color: '#64748B', totalSpent: 110.30 },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: '1', date: '2023-10-25', category: 'Food & Dining', amount: 45.50, description: 'Dinner at Italian Place' },
  { id: '2', date: '2023-10-24', category: 'Shopping', amount: 120.00, description: 'New Sneakers' },
  { id: '3', date: '2023-10-23', category: 'Bills & Utilities', amount: 85.00, description: 'Electricity Bill' },
  { id: '4', date: '2023-10-22', category: 'Food & Dining', amount: 12.50, description: 'Coffee & Bagel' },
  { id: '5', date: '2023-10-20', category: 'Travel', amount: 120.00, description: 'Train Ticket' },
  { id: '6', date: '2023-10-19', category: 'Shopping', amount: 340.20, description: 'Electronics Store' },
  { id: '7', date: '2023-10-18', category: 'Bills & Utilities', amount: 145.75, description: 'Internet Subscription' },
];