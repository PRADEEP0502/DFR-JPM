import React, { useState } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Zap,
  Activity,
  GitCommit,
  Check,
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

  const stages = [
    { label: 'Inward', color: 'text-sky-400', bg: 'bg-sky-500/20', border: 'border-sky-500/40' },
    { label: 'IAD', color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/40' },
    { label: 'AO', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/40' },
    { label: 'JMD', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
    { label: 'Accounts', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
    { label: 'Tally', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40' },
  ];

  return (
    <div className="min-h-screen w-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center p-3 sm:p-6 lg:p-10 relative overflow-hidden font-sans selection:bg-sky-500 selection:text-white">
      {/* Dynamic Background Mesh & Glowing Orbs */}
      <div className="absolute top-[-20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sky-600/20 to-blue-600/10 blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[650px] h-[650px] rounded-full bg-gradient-to-tl from-indigo-600/20 via-purple-600/15 to-transparent blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[350px] h-[350px] rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />

      {/* Subtle Geometric Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Luxury Glass Container Card */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl sm:rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.65)] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Left Side: Brand Showcase & Interactive Pipeline Graphic */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-900/90 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden">
          
          {/* Subtle Ambient Light Cone */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6 sm:space-y-8 relative z-10">
            {/* Official Mill Branding */}
            <div className="flex items-center gap-3.5">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-500 to-sky-500 opacity-75 blur-xs group-hover:opacity-100 transition duration-300" />
                <img
                  src="/jpm_logo.jpg"
                  alt="Junior Processing Mill Logo"
                  className="relative w-13 h-13 rounded-full object-cover border-2 border-white/20 shadow-xl p-0.5 bg-slate-900 shrink-0"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-white font-sans">
                    Junior Processing Mill
                  </h1>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300 uppercase tracking-widest">
                    DFR Enterprise Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-100 tracking-tight leading-snug">
                Unified Custody Tracking & ERP Lifecycle Platform
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Real-time Selsoft API integration with automated stage routing, physical custody handovers, and strict BRDate ageing alerts.
              </p>
            </div>

            {/* Live Pipeline Flow Graphic */}
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3 text-sky-400" />
                  Standard Pipeline Stages
                </span>
                <span className="text-[10px] font-mono font-semibold text-sky-400/90">6 Stage Gateways</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {stages.map((stg, i) => (
                  <div
                    key={stg.label}
                    className={`p-2 rounded-xl ${stg.bg} border ${stg.border} flex items-center gap-1.5 transition hover:scale-102`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
                    <span className={`text-[11px] font-black tracking-tight truncate ${stg.color}`}>
                      {stg.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Highlights */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="font-medium">Single Dashboard: Exact bill location & holder</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Zap className="w-3 h-3" />
                </div>
                <span className="font-medium">Direct Selsoft ERP 30-min sync & MongoDB cloud</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <span className="font-medium">Bcrypt password security & persistent session</span>
              </div>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="pt-6 mt-6 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Role-Based Access Control
            </span>
            <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
              v2.5 Enterprise
            </span>
          </div>
        </div>

        {/* Right Side: Luxury Authentication Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center relative">
          
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Form Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Authorized Staff Login</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Sign in to DFR
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter your User ID and password to access the bill register
              </p>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-200 text-xs font-semibold shadow-lg shadow-red-950/50 animate-in shake duration-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
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
                    placeholder="e.g. dfr_admin, vanitha, suriya, jmd"
                    className="w-full bg-slate-950/70 border border-slate-700/80 hover:border-slate-600 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 focus:bg-slate-950 transition duration-200 min-h-[46px] shadow-inner"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                </div>
                
                <div className="relative group">
                  <KeyRound className="w-4 h-4 text-slate-500 group-focus-within:text-sky-400 transition absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your security password"
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

              {/* Login Button with Premium Glow */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:via-indigo-500 hover:to-purple-500 active:scale-[0.99] text-white font-black text-sm tracking-wide rounded-2xl shadow-[0_10px_25px_rgba(56,189,248,0.25)] hover:shadow-[0_12px_30px_rgba(99,102,241,0.35)] transition-all duration-200 flex items-center justify-center gap-2.5 min-h-[48px] touch-manipulation disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Authenticating Credentials...</span>
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

            {/* Security Indicator */}
            <div className="pt-3 text-center">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                <Lock className="w-3 h-3 text-emerald-400" />
                End-to-End Encrypted Session • MongoDB Cloud
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
