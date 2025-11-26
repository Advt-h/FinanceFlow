// --- Delete Category and its Expenses ---
/**
 * Deletes a category and all expenses with that category for the current user.
 */
export async function deleteCategoryAndExpenses(categoryName: string) {
  const uid = getUid();
  // 1. Find and delete the category document(s) with this name
  const catSnap = await getDocs(collection(db, `users/${uid}/categories`));
  const catDocs = catSnap.docs.filter(doc => doc.data().name === categoryName);
  for (const docRef of catDocs) {
    await deleteDoc(doc(db, `users/${uid}/categories/${docRef.id}`));
  }
  // 2. Find and delete all expenses with this category
  const expSnap = await getDocs(collection(db, `users/${uid}/expenses`));
  const expDocs = expSnap.docs.filter(doc => doc.data().category === categoryName);
  for (const docRef of expDocs) {
    await deleteDoc(doc(db, `users/${uid}/expenses/${docRef.id}`));
  }
}

import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, sendEmailVerification, sendPasswordResetEmail as fbSendPasswordResetEmail
} from "firebase/auth";

// --- Forgot Password ---
/**
 * Sends a password reset email to the given address.
 */
export async function sendPasswordReset(email: string) {
  await fbSendPasswordResetEmail(auth, email);
}
// --- Change Password ---
/**
 * Changes the current user's password.
 * @param newPassword The new password to set
 */
export async function changeUserPassword(newPassword: string) {
  if (!auth.currentUser) throw new Error("No authenticated user");
  await updatePassword(auth.currentUser, newPassword);
}
import {
  getFirestore, doc, setDoc, addDoc, getDocs, updateDoc, deleteDoc, collection
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


// --- Helper: Get current user UID ---
function getUid() {
  if (!auth.currentUser) throw new Error("No authenticated user");
  return auth.currentUser.uid;
}

// --- User Signup (creates Firestore user doc) ---
/**
 * Registers a new user and creates their Firestore profile.
 */
export async function registerUser(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;
  await setDoc(doc(db, `users/${uid}`), {
    email,
    createdAt: new Date()
  });
  // Send email verification
  if (userCredential.user) {
    await sendEmailVerification(userCredential.user);
  }
  return userCredential.user;
}

// --- User Login ---
/**
 * Logs in a user with email and password.
 */
export async function loginUser(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

// --- Add Expense ---
/**
 * Adds a new expense for the current user.
 */
export async function addExpense(amount: number, category: string, date: Date, description: string) {
  const uid = getUid();
  await addDoc(collection(db, `users/${uid}/expenses`), {
    amount,
    category,
    date,
    description
  });
}

// --- Update Expense ---
/**
 * Updates an existing expense for the current user.
 */
export async function updateExpense(expenseId: string, data: { amount?: number; category?: string; date?: Date; note?: string }) {
  const uid = getUid();
  await updateDoc(doc(db, `users/${uid}/expenses/${expenseId}`), data);
}

// --- Delete Expense ---
/**
 * Deletes an expense for the current user.
 */
export async function deleteExpense(expenseId: string) {
  const uid = getUid();
  await deleteDoc(doc(db, `users/${uid}/expenses/${expenseId}`));
}

// --- Load All Expenses ---
/**
 * Loads all expenses for the current user.
 */
export async function loadExpenses() {
  const uid = getUid();
  const snapshot = await getDocs(collection(db, `users/${uid}/expenses`));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// --- Add Category ---
/**
 * Adds a new category for the current user.
 */
export async function addCategory(name: string, color: string) {
  const uid = getUid();
  await addDoc(collection(db, `users/${uid}/categories`), { name, color });
}

// --- Add or Update Monthly Budget ---
/**
 * Adds or updates a monthly budget for the current user.
 */
export async function setMonthlyBudget(month: string, limit: number, spent: number) {
  const uid = getUid();
  await setDoc(doc(db, `users/${uid}/budgets/${month}`), { month, limit, spent });
}

// --- Load Categories ---
/**
 * Loads all categories for the current user.
 */
export async function loadCategories() {
  const uid = getUid();
  const snapshot = await getDocs(collection(db, `users/${uid}/categories`));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// --- Load Budgets ---
/**
 * Loads all budgets for the current user.
 */
export async function loadBudgets() {
  const uid = getUid();
  const snapshot = await getDocs(collection(db, `users/${uid}/budgets`));
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data
    };
  });
}
