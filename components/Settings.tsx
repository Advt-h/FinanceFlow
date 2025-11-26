import React, { useState } from 'react';
import { Save, KeyRound } from 'lucide-react';
import { changeUserPassword } from '../services/firebase';

interface SettingsProps {
  monthlyBudget: number;
  setMonthlyBudget: (amount: number) => void;
  currency: string;
  setCurrency: (currency: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ monthlyBudget, setMonthlyBudget, currency, setCurrency }) => {
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  const handleSave = () => {
    const amount = parseFloat(budgetInput);
    if (!isNaN(amount) && amount > 0) {
      setMonthlyBudget(amount);
    }
  };

  // Change Password State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      await changeUserPassword(newPassword);
      setPasswordSuccess('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-[#E5E7EB]">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#E5E7EB]">Settings</h2>
        <p className="text-[#A1A1AA] mt-1">Manage your account preferences</p>
      </div>

      <div className="bg-[#181A1F] rounded-2xl border border-[#23262b] p-8 shadow-md mb-8">
        <h3 className="text-lg font-bold text-[#E5E7EB] mb-6 pb-4 border-b border-[#23262b]">General Settings</h3>
        <div className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#A1A1AA]">Monthly Budget Target</label>
            <div className="relative">
              <input 
                type="number" 
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#E5E7EB]"
                placeholder="2000"
              />
            </div>
            <p className="text-xs text-[#A1A1AA]">Set your monthly spending limit goal.</p>
          </div>



          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#A1A1AA]">Currency</label>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#E5E7EB] appearance-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-[#E5E7EB] font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-[#181A1F] rounded-2xl border border-[#23262b] p-8 shadow-md">
        <h3 className="text-lg font-bold text-[#E5E7EB] mb-6 pb-4 border-b border-[#23262b] flex items-center gap-2">
          <KeyRound size={18} /> Change Password
        </h3>
        {!showChangePassword ? (
          <button
            className="px-5 py-2 bg-[#23262b] hover:bg-[#23262b]/80 text-[#E5E7EB] rounded-xl font-medium transition-all"
            onClick={() => setShowChangePassword(true)}
          >
            Change Password
          </button>
        ) : (
          <form className="space-y-5 max-w-md" onSubmit={handleChangePassword}>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#E5E7EB]"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#E5E7EB]"
                minLength={6}
                required
              />
            </div>
            {passwordError && <div className="text-red-400 text-sm">{passwordError}</div>}
            {passwordSuccess && <div className="text-green-400 text-sm">{passwordSuccess}</div>}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-[#E5E7EB] font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-60"
              >
                {passwordLoading ? 'Saving...' : 'Update Password'}
              </button>
              <button
                type="button"
                className="px-5 py-2 bg-[#23262b] hover:bg-[#23262b]/80 text-[#E5E7EB] rounded-xl font-medium transition-all"
                onClick={() => {
                  setShowChangePassword(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;