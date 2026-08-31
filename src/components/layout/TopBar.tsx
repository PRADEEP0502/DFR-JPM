import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Clock, UserCheck, Menu, Shield, LogOut } from 'lucide-react';
import { DfrUser, UserRole, SyncState } from '../../types/dfr';

interface TopBarProps {
  currentUser: DfrUser;
  users: DfrUser[];
  onSwitchUser: (user: DfrUser) => void;
  syncState: SyncState;
  onSyncNow: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onLogout?: () => void;
  onToggleMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  users,
  onSwitchUser,
  syncState,
  onSyncNow,
  searchQuery,
  onSearchChange,
  onLogout,
  onToggleMobileMenu,
}) => {
  const [syncTimeFormatted, setSyncTimeFormatted] = useState<string>('Synced just now');

  useEffect(() => {
    const formatTime = () => {
      if (!syncState.last_synced_at) {
        setSyncTimeFormatted('Live Sync Active');
        return;
      }
      const last = new Date(syncState.last_synced_at).getTime();
      const diffMs = Date.now() - last;
      const mins = Math.max(0, Math.floor(diffMs / (1000 * 60)));

      if (mins < 1) {
        setSyncTimeFormatted('Synced just now');
      } else if (mins < 60) {
        setSyncTimeFormatted(`Synced ${mins}m ago`);
      } else {
        const hours = Math.floor(mins / 60);
        if (hours < 24) {
          setSyncTimeFormatted(`Synced ${hours}h ago`);
        } else {
          setSyncTimeFormatted(`Synced ${Math.floor(hours / 24)}d ago`);
        }
      }
    };

    formatTime();
    const interval = setInterval(formatTime, 15000);
    return () => clearInterval(interval);
  }, [syncState.last_synced_at]);

  const roleColors: Record<UserRole, string> = {
    ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
    MD: 'bg-purple-50 text-purple-700 border-purple-200',
    MANAGER: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    STAFF: 'bg-sky-50 text-sky-700 border-sky-200',
    ACCOUNTS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs shrink-0 gap-2 sm:gap-4 font-sans">
      {/* Left Area: Mobile Menu Button + Search */}
      <div className="flex items-center gap-2 flex-1 max-w-xl">
        {/* Mobile Hamburger Toggle */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bills, suppliers, BR No..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition min-h-[38px]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold p-1 cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Modern Sync Pill */}
        <div className="flex items-center bg-slate-50 border border-slate-200/90 rounded-xl p-1 text-xs shadow-2xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-600 font-medium text-[11px] sm:text-xs whitespace-nowrap">
              {syncTimeFormatted}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          <button
            onClick={onSyncNow}
            disabled={syncState.is_syncing}
            className="flex items-center gap-1.5 px-2.5 py-1 text-sky-600 hover:text-sky-700 hover:bg-sky-50/80 rounded-lg font-bold text-xs disabled:opacity-50 transition cursor-pointer"
            title="Trigger Selsoft ERP Sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncState.is_syncing ? 'animate-spin text-sky-600' : ''}`} />
            <span className="hidden sm:inline">{syncState.is_syncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
            {currentUser.full_name.charAt(0).toUpperCase()}
          </div>
          
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 text-xs leading-none">
                {currentUser.full_name}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${
                  roleColors[currentUser.role] || 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {currentUser.role}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
              {currentUser.department}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Logout from session"
            className="p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition flex items-center justify-center min-h-[36px] min-w-[36px] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
