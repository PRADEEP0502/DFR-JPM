import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Clock, UserCheck, Menu } from 'lucide-react';
import { DfrUser, UserRole, SyncState } from '../../types/dfr';

interface TopBarProps {
  currentUser: DfrUser;
  users: DfrUser[];
  onSwitchUser: (user: DfrUser) => void;
  syncState: SyncState;
  onSyncNow: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
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
  onToggleMobileMenu,
}) => {
  const [minutesAgo, setMinutesAgo] = useState<number>(0);
  const [nextInMins, setNextInMins] = useState<number>(30);

  useEffect(() => {
    const calcAgo = () => {
      if (syncState.last_synced_at) {
        const last = new Date(syncState.last_synced_at).getTime();
        const diffMs = Date.now() - last;
        setMinutesAgo(Math.max(0, Math.floor(diffMs / (1000 * 60))));
      }

      if (syncState.next_sync_at) {
        const next = new Date(syncState.next_sync_at).getTime();
        const remainMs = next - Date.now();
        setNextInMins(Math.max(0, Math.ceil(remainMs / (1000 * 60))));
      }
    };

    calcAgo();
    const interval = setInterval(calcAgo, 15000);
    return () => clearInterval(interval);
  }, [syncState.last_synced_at, syncState.next_sync_at]);

  const roleColors: Record<UserRole, string> = {
    MD: 'bg-purple-100 text-purple-700 border-purple-200',
    MANAGER: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    STAFF: 'bg-sky-100 text-sky-700 border-sky-200',
    ACCOUNTS: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs shrink-0 gap-2 sm:gap-4">
      {/* Left Area: Mobile Menu Button + Search */}
      <div className="flex items-center gap-2 flex-1 max-w-xl">
        {/* Mobile Hamburger Toggle */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition min-h-[40px] min-w-[40px] flex items-center justify-center"
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
            className="w-full bg-slate-100/90 border border-slate-200 rounded-xl pl-9 pr-8 py-1.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition min-h-[38px]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold p-1"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Sync Status & Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100/90 border border-slate-200 rounded-xl px-2 sm:px-3 py-1.5 text-xs shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Clock className="w-3.5 h-3.5 text-slate-400 hidden sm:inline shrink-0" />
            <span className="text-slate-700 font-medium hidden md:inline">
              {minutesAgo === 0 ? 'Synced just now' : `Synced ${minutesAgo}m ago`}
            </span>
          </div>

          <button
            onClick={onSyncNow}
            disabled={syncState.is_syncing}
            className="flex items-center gap-1 sm:ml-2 sm:pl-2 sm:border-l border-slate-300 text-sky-600 hover:text-sky-700 font-bold disabled:opacity-50 transition min-h-[32px] px-1 touch-manipulation"
            title="Near-real-time ERP sync trigger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncState.is_syncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{syncState.is_syncing ? 'Syncing...' : 'Sync Now'}</span>
            <span className="sm:hidden text-[11px] font-bold">Sync</span>
          </button>
        </div>

        {/* Role Selector (Demo Mode) */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 border border-slate-200 rounded-xl px-2 sm:px-3 py-1.5 text-xs shadow-2xs">
          <div className="hidden xl:flex items-center gap-1 text-slate-500 font-medium border-r border-slate-300 pr-2">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">Role:</span>
          </div>

          <select
            value={currentUser.id}
            onChange={e => {
              const u = users.find(x => x.id === e.target.value);
              if (u) onSwitchUser(u);
            }}
            className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs max-w-[90px] sm:max-w-[130px] md:max-w-none truncate min-h-[32px]"
          >
            {users
              .filter(u => u.id !== 'user-000')
              .map(u => (
                <option key={u.id} value={u.id} className="bg-white text-slate-900">
                  {u.full_name} ({u.role})
                </option>
              ))}
          </select>

          <span
            className={`hidden sm:inline-block px-2 py-0.5 rounded border text-[10px] font-extrabold ${
              roleColors[currentUser.role]
            }`}
          >
            {currentUser.role}
          </span>
        </div>
      </div>
    </header>
  );
};
