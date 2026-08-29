import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  AlertTriangle,
  Users,
  Calculator,
  Tags,
  FileText,
  Database,
  GitFork,
  X,
} from 'lucide-react';

export type ViewTab =
  | 'dashboard'
  | 'register'
  | 'critical'
  | 'by_holder'
  | 'tally'
  | 'labels'
  | 'category_mapping'
  | 'reports'
  | 'sql_schema';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  criticalCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  criticalCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'register', label: 'Bill Register', icon: FileSpreadsheet },
    {
      id: 'critical',
      label: 'Critical (A-10)',
      icon: AlertTriangle,
      badge: criticalCount > 0 ? criticalCount : undefined,
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    { id: 'by_holder', label: 'By Holder', icon: Users },
    { id: 'tally', label: 'Tally Tracker', icon: Calculator },
    { id: 'labels', label: 'Labels Manager', icon: Tags },
    { id: 'category_mapping', label: 'Category Mappings', icon: GitFork },
    { id: 'reports', label: 'Reports / Export', icon: FileText },
    { id: 'sql_schema', label: 'Supabase SQL', icon: Database },
  ];

  const handleItemClick = (tabId: ViewTab) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-3">
          <img
            src="/jpm_logo.jpg"
            alt="Junior Processing Mill Logo"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-red-500/80 shadow-md p-0.5 bg-white shrink-0"
          />
          <div>
            <h1 className="font-extrabold text-slate-900 text-sm tracking-tight leading-tight">
              Junior Processing Mill
            </h1>
            <p className="text-[11px] text-red-600 font-bold tracking-tight">DFR Bill Flow Register</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden w-8 h-8 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
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
              onClick={() => handleItemClick(item.id as ViewTab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 touch-manipulation min-h-[44px] ${
                isActive
                  ? 'bg-sky-50 text-sky-700 border border-sky-200/80 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 active:bg-slate-200/60'
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

      {/* Footer info */}
      <div className="p-3 border-t border-slate-100 text-center">
        <span className="text-[10px] font-semibold text-slate-400">
          DFR v2.4 • Live Selsoft ERP Sync
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 flex-col h-screen shrink-0 selection:bg-sky-500 shadow-sm z-30">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Slide-over Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={e => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
