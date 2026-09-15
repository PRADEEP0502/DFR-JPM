import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  AlertTriangle,
  Users,
  Calculator,
  Tags,
  FileText,
  GitFork,
  Settings,
  LogOut,
  Shield,
  X,
  ChevronLeft,
} from 'lucide-react';
import { DfrUser } from '../../types/dfr';
import { isTallyTrackerAuthorized, isAdminSettingsAuthorized } from '../../services/authService';

export type ViewTab =
  | 'dashboard'
  | 'register'
  | 'critical'
  | 'by_holder'
  | 'tally'
  | 'process_flow'
  | 'labels'
  | 'category_mapping'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  criticalCount: number;
  currentUser: DfrUser;
  onLogout: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  criticalCount,
  currentUser,
  onLogout,
  isOpen = true,
  onToggle,
  onClose,
}) => {
  const canAccessSettings = isAdminSettingsAuthorized(currentUser);
  const canAccessTally = isTallyTrackerAuthorized(currentUser);

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
    ...(canAccessTally
      ? [{ id: 'tally', label: 'Tally Tracker', icon: Calculator }]
      : []),
    { id: 'process_flow', label: 'Process Flow', icon: GitFork },
    { id: 'labels', label: 'Labels Manager', icon: Tags },
    { id: 'category_mapping', label: 'Category Mappings', icon: GitFork },
    { id: 'reports', label: 'Reports / Export', icon: FileText },
    ...(canAccessSettings
      ? [
          {
            id: 'settings',
            label: 'Admin Settings',
            icon: Settings,
          },
        ]
      : []),
  ];

  const handleItemClick = (tabId: ViewTab) => {
    onSelectTab(tabId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white w-64 select-none">
      {/* Brand Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <img
            src="/jpm_logo.jpg"
            alt="Junior Processing Mill Logo"
            className="w-10 h-10 rounded-full object-cover border-2 border-red-500/80 shadow-md p-0.5 bg-white shrink-0"
          />
          <div className="overflow-hidden min-w-0">
            <h1 className="font-extrabold text-slate-900 text-sm tracking-tight leading-tight truncate">
              Junior Processing Mill
            </h1>
            <p className="text-[11px] text-red-600 font-bold tracking-tight truncate">DFR Bill Flow Register</p>
          </div>
        </div>

        {/* Close / Collapse Button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition cursor-pointer shrink-0 shadow-2xs active:scale-95"
          title="Close / Collapse sidebar"
          aria-label="Close sidebar"
        >
          <ChevronLeft className="w-4 h-4 hidden lg:block" />
          <X className="w-4 h-4 lg:hidden" />
        </button>
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 touch-manipulation min-h-[44px] cursor-pointer ${
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

      {/* Authenticated User Profile & Logout */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/70 space-y-2 shrink-0">
        <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
              {currentUser.full_name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <span className="font-black text-slate-900 text-xs truncate block">
                {currentUser.full_name}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase truncate block">
                {currentUser.department} • {currentUser.role}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Log out"
            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 transition shrink-0 cursor-pointer"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center">
          <span className="text-[10px] font-semibold text-slate-400">
            DFR Enterprise v2.5 • Live ERP
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen shrink-0 bg-white border-r border-slate-200/90 selection:bg-sky-500 shadow-sm z-30 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 border-r-0 pointer-events-none'
        }`}
      >
        <div className="w-64 h-full flex flex-col shrink-0">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile / Tablet Slide-over Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
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
