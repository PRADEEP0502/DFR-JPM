import React, { useState } from 'react';
import {
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  AlertCircle,
  KeyRound,
  Lock,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { DfrUser } from '../../types/dfr';

interface LoginViewProps {
  onLoginSuccess: (user: DfrUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await authService.login(username, password);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Invalid User ID or password. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between items-center p-4 sm:p-8 font-sans selection:bg-red-600 selection:text-white relative">
      
      {/* Top Subtle Brand Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="tracking-wide uppercase text-[11px] font-bold text-slate-400">
            DFR System • Production Server
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          SECURE 256-BIT ENCRYPTION
        </div>
      </header>

      {/* Main Bespoke Login Card */}
      <main className="w-full max-w-[420px] my-auto">
        <div className="bg-[#121826] border border-slate-800/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-7 sm:p-9 relative overflow-hidden">
          
          {/* Subtle Top Red & Blue Brand Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-sky-500 to-indigo-600" />

          {/* Logo & Corporate Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-1 rounded-full bg-slate-900 border border-slate-700/80 shadow-md mb-4.5">
              <img
                src="/jpm_logo.jpg"
                alt="Junior Processing Mill Logo"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>

            <h1 className="text-xl sm:text-[22px] font-bold text-white tracking-tight">
              Junior Processing Mill
            </h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Document / Bill Flow Register
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 bg-red-950/70 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-red-200 text-xs font-medium animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* User ID Field */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                User ID / Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. dfr_admin, vanitha, jmd"
                  className="w-full bg-[#0d121f] border border-slate-700/90 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0d121f] border border-slate-700/90 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-sm rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer inside card */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Role-Based Access
            </span>
            <span className="font-mono text-slate-400">v2.5</span>
          </div>
        </div>
      </main>

      {/* Corporate Page Footer */}
      <footer className="w-full max-w-5xl py-3 text-center text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/60 gap-2">
        <span>© {new Date().getFullYear()} Junior Processing Mill. All rights reserved.</span>
        <span className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-slate-400" />
          Enterprise Bill Management System
        </span>
      </footer>
    </div>
  );
};
