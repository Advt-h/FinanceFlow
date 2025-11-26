import React, { useState } from 'react';
import { Page } from '../types';
import { loginUser, sendPasswordReset } from '../services/firebase';

interface LoginProps {
  onLogin: () => void;
  onNavigate: (page: Page) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Forgot password modal state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotErr, setForgotErr] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoading(true);
      setError('');
      
      try {
        await loginUser(email, password);
        onLogin(); // Call parent handler to set app state
      } catch (err: any) {
        if (err.code === 'auth/invalid-credential') {
            setError('Invalid email or password.');
        } else {
            setError('Failed to login. Please check your connection.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F12] flex items-center justify-center p-4 text-[#E5E7EB]">
      <div className="bg-[#181A1F] w-full max-w-md rounded-2xl shadow-2xl border border-[#23262b] p-8 relative">
        {/* Forgot Password Modal */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#181A1F] border border-[#23262b] rounded-2xl p-8 w-full max-w-sm shadow-2xl relative">
              <button onClick={() => { setShowForgot(false); setForgotMsg(''); setForgotErr(''); setForgotEmail(''); }} className="absolute top-3 right-4 text-[#A1A1AA] text-xl font-bold">×</button>
              <h2 className="text-xl font-bold mb-2 text-[#E5E7EB]">Reset Password</h2>
              <p className="text-[#A1A1AA] mb-4 text-sm">Enter your email address and we'll send you a password reset link.</p>
              {forgotErr && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl text-sm mb-3">{forgotErr}</div>}
              {forgotMsg && <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-2 rounded-xl text-sm mb-3">{forgotMsg}</div>}
              <form onSubmit={async (e) => {
                e.preventDefault();
                setForgotErr('');
                setForgotMsg('');
                setForgotLoading(true);
                try {
                  await sendPasswordReset(forgotEmail);
                  setForgotMsg('Password reset email sent! Please check your inbox.');
                  setForgotEmail('');
                } catch (err: any) {
                  if (err.code === 'auth/user-not-found') {
                    setForgotErr('No account found with that email.');
                  } else if (err.code === 'auth/invalid-email') {
                    setForgotErr('Please enter a valid email address.');
                  } else {
                    setForgotErr('Failed to send reset email. Please try again.');
                  }
                } finally {
                  setForgotLoading(false);
                }
              }} className="space-y-4">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-[#E5E7EB] placeholder-[#A1A1AA] transition-all"
                  placeholder="your@email.com"
                  disabled={forgotLoading}
                />
                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </div>
          </div>
        )}
        {/* ...existing code... */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
             <span className="text-[#E5E7EB] font-bold text-2xl">F</span>
          </div>
          <h1 className="text-2xl font-bold text-[#E5E7EB]">Welcome Back</h1>
          <p className="text-[#A1A1AA] mt-1">Sign in to FinanceFlow</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#A1A1AA]">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-[#E5E7EB] placeholder-[#A1A1AA] transition-all"
              placeholder="john@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#A1A1AA]">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#0D0F12] border border-[#23262b] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-[#E5E7EB] placeholder-[#A1A1AA] transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-indigo-400 font-medium hover:text-indigo-300 bg-transparent border-none outline-none"
              onClick={() => setShowForgot(true)}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform active:scale-[0.98]"
          >
            {isLoading ? 'Signing In...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[#A1A1AA] text-sm">
            Don't have an account?{' '}
            <button 
              onClick={() => onNavigate(Page.REGISTER)}
              className="text-indigo-400 font-bold hover:text-indigo-300 ml-1"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;