import React, { useState } from 'react';
import { Page } from '../types';
import { registerUser } from '../services/firebase';

interface RegisterProps {
  onNavigate: (page: Page) => void;
  onLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate, onLogin }) => {
  // Removed name state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Register the user in Firebase Auth and Firestore
      await registerUser(email, password);
      setSuccess('Registration successful! Please check your email for a verification link before logging in.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      // Handle Firebase specific error codes if desired
      if (err.code === 'auth/email-already-in-use') {
        setError('That email address is already in use!');
      } else if (err.code === 'auth/invalid-email') {
        setError('That email address is invalid!');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Failed to register. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F12] flex items-center justify-center p-4 text-[#E5E7EB]">
      <div className="bg-[#181A1F] w-full max-w-md rounded-2xl shadow-2xl border border-[#23262b] p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
             <span className="text-[#E5E7EB] font-bold text-2xl">F</span>
          </div>
          <h1 className="text-2xl font-bold text-[#E5E7EB]">Create Account</h1>
          <p className="text-[#A1A1AA] mt-1">Start your financial journey</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name field removed */}

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-[#A1A1AA]">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-[#E5E7EB] placeholder-[#A1A1AA] transition-all"
              placeholder="john@example.com"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-[#A1A1AA]">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-[#E5E7EB] placeholder-[#A1A1AA] transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-[#A1A1AA]">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-[#E5E7EB] placeholder-[#A1A1AA] transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform active:scale-[0.98]"
            >
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#A1A1AA] text-sm">
            Already have an account?{' '}
            <button 
              onClick={() => onNavigate(Page.LOGIN)}
              className="text-indigo-400 font-bold hover:text-indigo-300 ml-1"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;