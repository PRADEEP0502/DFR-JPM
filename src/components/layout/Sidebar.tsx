import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  AlertTriangle,
  Users,
  UserCheck,
  Calculator,
  CreditCard,
  Tags,
  FileText,
  Database
} from 'lucide-react';

export type ViewTab =
  | 'dashboard'
  | 'register'
  | 'critical'
  | 'by_holder'
  | 'by_owner'
  | 'tally'
  | 'payment'
  | 'labels'
  | 'reports'
  | 'sql_schema';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  criticalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, criticalCount }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'register', label: 'Bill Register', icon: FileSpreadsheet },
    {
      id: 'critical',
      label: 'Critical (A-10)',
      icon: AlertTriangle,
      badge: criticalCount > 0 ? criticalCount : undefined,
      badgeColor: 'bg-red-500 text-white animate-pulse'
    },
    { id: 'by_holder', label: 'By Holder', icon: Users },
    { id: 'by_owner', label: 'By Owner', icon: UserCheck },
    { id: 'tally', label: 'Tally Tracker', icon: Calculator },
    { id: 'payment', label: 'Payment Tracker', icon: CreditCard },
    { id: 'labels', label: 'Labels Manager', icon: Tags },
    { id: 'reports', label: 'Reports / Export', icon: FileText },
    { id: 'sql_schema', label: 'Supabase SQL', icon: Database },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen shrink-0 selection:bg-sky-500 shadow-sm z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
        <img
          src="/jpm_logo.jpg"
          alt="Junior Processing Mill Logo"
          className="w-11 h-11 rounded-full object-cover border-2 border-red-500/80 shadow-md p-0.5 bg-white shrink-0"
        />
        <div>
          <h1 className="font-extrabold text-slate-900 text-sm tracking-tight leading-tight">
            Junior Processing Mill
          </h1>
          <p className="text-[11px] text-red-600 font-bold tracking-tight">DFR Bill Flow Register</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Navigation
        </div>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as ViewTab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sky-50 text-sky-700 border border-sky-200/80 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

    </aside>
  );
};
