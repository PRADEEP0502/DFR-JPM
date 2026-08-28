import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Clock, UserCheck } from 'lucide-react';
import { DfrUser, UserRole, SyncState } from '../../types/dfr';

interface TopBarProps {
  currentUser: DfrUser;
  users: DfrUser[];
  onSwitchUser: (user: DfrUser) => void;
  syncState: SyncState;
  onSyncNow: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  users,
  onSwitchUser,
  syncState,
  onSyncNow,
  searchQuery,
  onSearchChange,
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
    <header className="h-16 bg-white/90 backdrop-blur border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Input */}
      <div className="relative w-72 md:w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search Header ID, BR No, Bill No, Supplier..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full bg-slate-100/80 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Sync Status & Trigger */}
        <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-700 font-medium">
              Last Synced: {minutesAgo === 0 ? 'just now' : `${minutesAgo}m ago`}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold ml-1">
              (Next in {nextInMins}m)
            </span>
          </div>

          <button
            onClick={onSyncNow}
            disabled={syncState.is_syncing}
            className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-300 text-sky-600 hover:text-sky-700 font-bold disabled:opacity-50 transition"
            title="Near-real-time ERP sync trigger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncState.is_syncing ? 'animate-spin' : ''}`} />
            <span>{syncState.is_syncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>

        {/* Persona Switcher (Demo / Testing Mode Explicit Label) */}
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
          <div className="flex items-center gap-1 text-slate-500 font-medium border-r border-slate-300 pr-2">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">Demo Role:</span>
          </div>

          <select
            value={currentUser.id}
            onChange={e => {
              const u = users.find(x => x.id === e.target.value);
              if (u) onSwitchUser(u);
            }}
            className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
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
            className={`px-2 py-0.5 rounded border text-[10px] font-extrabold ${
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
