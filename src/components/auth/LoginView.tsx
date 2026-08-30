import React, { useState } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Layers,
  CheckCircle2,
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
        setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-sky-500 selection:text-white">
      {/* 3D Background Decorative Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-sky-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Side: Brand & Pipeline Highlights */}
        <div className="lg:col-span-5 bg-gradient-to-br from-sky-950 via-slate-900 to-indigo-950 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            {/* Logo Badge */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 border border-sky-400/30">
                <Layers className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  DFR Enterprise
                </h1>
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  Document / Bill Flow Register
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h2 className="text-base font-extrabold text-slate-100">
                Unified Bill Custody & Stage Pipeline
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live Selsoft ERP synchronization, configurable Category-to-Holder routing, immutable audit logs, and strict BRDate ageing alerts.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Single Dashboard: Where is every bill?</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bill Inward → IAD → AO → JMD → Accounts → Tally</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Strict A-3 / A-5 / A-10 Critical Ageing tracking</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Persistent enterprise session authentication</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Role-Based Access Control
            </span>
            <span className="font-mono text-slate-400">v2.5 Enterprise</span>
          </div>
        </div>

        {/* Right Side: Secure Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-6">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Sign in to your account
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter your User ID and password to access the DFR dashboard
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-center gap-3 text-red-200 text-xs font-semibold animate-in shake duration-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  User ID / Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your User ID (e.g. dfr_admin, vanitha, jmd)"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition min-h-[44px]"
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

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-sky-500/20 transition flex items-center justify-center gap-2 min-h-[46px] touch-manipulation disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
