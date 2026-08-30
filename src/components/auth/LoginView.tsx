import React, { useState } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  KeyRound,
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
        setErrorMessage(res.error || 'User ID or password incorrect. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-sky-500 selection:text-white">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-sky-600/20 to-blue-600/10 blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-tl from-indigo-600/20 via-purple-600/15 to-transparent blur-[140px] pointer-events-none" />

      {/* Subtle Geometric Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Centered Luxury Glass Container Card */}
      <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl sm:rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.7)] p-6 sm:p-10 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="relative group">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-red-500 via-sky-500 to-indigo-500 opacity-75 blur-xs group-hover:opacity-100 transition duration-300" />
            <img
              src="/jpm_logo.jpg"
              alt="Junior Processing Mill Logo"
              className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 border-white/20 shadow-2xl p-0.5 bg-slate-950 shrink-0"
            />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              Junior Processing Mill
            </h1>
            <p className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-300 uppercase tracking-widest mt-1">
              Document / Bill Flow Register
            </p>
          </div>
        </div>

        {/* Error Message Banner */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-950/80 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-200 text-xs font-semibold shadow-lg shadow-red-950/50 animate-in shake duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* User ID Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
              User ID / Name
            </label>
            <div className="relative group">
              <User className="w-4 h-4 text-slate-500 group-focus-within:text-sky-400 transition absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter User ID (e.g. dfr_admin, vanitha, jmd)"
                className="w-full bg-slate-950/70 border border-slate-700/80 hover:border-slate-600 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 focus:bg-slate-950 transition duration-200 min-h-[46px] shadow-inner"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <div className="relative group">
              <KeyRound className="w-4 h-4 text-slate-500 group-focus-within:text-sky-400 transition absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-950/70 border border-slate-700/80 hover:border-slate-600 rounded-2xl pl-10 pr-11 py-3 text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 focus:bg-slate-950 transition duration-200 min-h-[46px] shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:via-indigo-500 hover:to-purple-500 active:scale-[0.99] text-white font-black text-sm tracking-wide rounded-2xl shadow-[0_10px_25px_rgba(56,189,248,0.25)] hover:shadow-[0_12px_30px_rgba(99,102,241,0.35)] transition-all duration-200 flex items-center justify-center gap-2.5 min-h-[48px] touch-manipulation disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Security Badges */}
        <div className="pt-6 mt-6 border-t border-white/10 text-center flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            Role-Based Access
          </span>
          <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
            v2.5 Enterprise
          </span>
        </div>
      </div>
    </div>
  );
};
