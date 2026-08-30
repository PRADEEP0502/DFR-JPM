import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  ShieldCheck,
  History,
  KeyRound,
  UserPlus,
  Edit2,
  Trash2,
  Lock,
  RefreshCw,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  Sliders,
  Check,
  X,
} from 'lucide-react';
import { DfrUser, UserDepartment, UserRole, AccessLevel, AuditLogEntry, SyncState } from '../../types/dfr';
import { authService } from '../../services/authService';
import { auditService } from '../../services/auditService';
import { dfrService } from '../../services/dfrService';

interface AdminSettingsViewProps {
  currentUser: DfrUser;
  onRefresh: () => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ currentUser, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'sync'>('users');

  // User Management State
  const [usersList, setUsersList] = useState<DfrUser[]>(authService.getUsers());
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<DfrUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');

  // Form inputs
  const [formFullName, setFormFullName] = useState<string>('');
  const [formUsername, setFormUsername] = useState<string>('');
  const [formRole, setFormRole] = useState<UserRole>('STAFF');
  const [formDepartment, setFormDepartment] = useState<UserDepartment>('PURCHASE');
  const [formAccessLevel, setFormAccessLevel] = useState<AccessLevel>('DEPARTMENT_ACCESS');
  const [formInitialPassword, setFormInitialPassword] = useState<string>('dfr@123');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(auditService.getLogs());
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  // Sync Configuration
  const syncState: SyncState = dfrService.getSyncState();
  const [syncIntervalInput, setSyncIntervalInput] = useState<number>(syncState.sync_interval_mins);
  const [isSyncingNow, setIsSyncingNow] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const unsubAuth = authService.subscribe(() => {
      setUsersList(authService.getUsers());
    });
    const unsubAudit = auditService.subscribe(() => {
      setAuditLogs(auditService.getLogs());
    });
    return () => {
      unsubAuth();
      unsubAudit();
    };
  }, []);

  const handleOpenCreateUser = () => {
    setEditingUserId(null);
    setFormFullName('');
    setFormUsername('');
    setFormRole('STAFF');
    setFormDepartment('PURCHASE');
    setFormAccessLevel('DEPARTMENT_ACCESS');
    setFormInitialPassword('dfr@123');
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: DfrUser) => {
    setEditingUserId(user.id);
    setFormFullName(user.full_name);
    setFormUsername(user.username);
    setFormRole(user.role);
    setFormDepartment(user.department);
    setFormAccessLevel(user.access_level);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formUsername.trim()) return;

    if (editingUserId) {
      authService.updateUser(editingUserId, {
        full_name: formFullName.trim().toUpperCase(),
        username: formUsername.trim().toLowerCase(),
        role: formRole,
        department: formDepartment,
        access_level: formAccessLevel,
      });
      showToast(`User ${formFullName} updated successfully!`);
    } else {
      await authService.createUser(
        {
          full_name: formFullName.trim().toUpperCase(),
          username: formUsername.trim().toLowerCase(),
          role: formRole,
          department: formDepartment,
          access_level: formAccessLevel,
          active: true,
        },
        formInitialPassword || 'dfr@123'
      );
      showToast(`New user ${formFullName} created successfully!`);
    }

    setIsUserModalOpen(false);
    onRefresh();
  };

  const handleOpenResetPassword = (user: DfrUser) => {
    setPasswordTargetUser(user);
    setNewPasswordInput('');
    setIsPasswordModalOpen(true);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser || !newPasswordInput.trim()) return;

    await authService.resetPassword(passwordTargetUser.id, newPasswordInput.trim());
    showToast(`Password for ${passwordTargetUser.full_name} updated successfully!`);
    setIsPasswordModalOpen(false);
  };

  const handleToggleUserStatus = (user: DfrUser) => {
    authService.toggleUserActive(user.id);
    showToast(`Status changed for ${user.full_name}`);
    onRefresh();
  };

  const handleSaveSyncInterval = () => {
    dfrService.setSyncInterval(syncIntervalInput);
    showToast(`Auto-sync interval updated to ${syncIntervalInput} minutes.`);
  };

  const handleTriggerManualSync = async () => {
    setIsSyncingNow(true);
    showToast('Triggering Selsoft ERP synchronization...');
    await dfrService.syncErpBillsNow(true);
    setIsSyncingNow(false);
    showToast('Selsoft ERP synchronization completed successfully!');
    onRefresh();
  };

  const handleExportAuditCsv = () => {
    const csvContent = auditService.exportCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dfr_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit logs CSV exported.');
  };

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchSearch =
      auditSearch === '' ||
      log.user_name.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.header_id && log.header_id.toString().includes(auditSearch));

    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6 pb-16 max-w-full overflow-hidden text-slate-900 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Enterprise System Administration
            </h1>
            <p className="text-[11px] sm:text-xs text-sky-200/80 mt-0.5">
              Manage DFR system accounts, audit trails, and Selsoft ERP integration parameters
            </p>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users & Access</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>ERP Sync</span>
          </button>
        </div>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                Active System Accounts ({usersList.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage operational user accounts, department assignments, access levels, and security credentials.
              </p>
            </div>

            <button
              onClick={handleOpenCreateUser}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 self-start sm:self-auto min-h-[40px]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px] border-collapse">
                <thead className="bg-slate-100/80 text-slate-600 uppercase tracking-wider font-extrabold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-5">User / Full Name</th>
                    <th className="py-3.5 px-4">Username / ID</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">System Role</th>
                    <th className="py-3.5 px-4">Access Level</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-xs">
                            {u.full_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{u.full_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {u.username}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                          {u.department}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                            u.role === 'ADMIN'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : u.role === 'MD'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : u.role === 'MANAGER'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-bold text-slate-600">
                          {u.access_level === 'FULL_ACCESS'
                            ? 'Full System'
                            : u.access_level === 'FULL_EDIT'
                            ? 'Full Edit'
                            : 'Department'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          disabled={u.role === 'ADMIN'}
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border transition ${
                            u.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {u.active ? '● Active' : '○ Inactive'}
                        </button>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenResetPassword(u)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-sky-700 hover:bg-sky-50 transition"
                            title="Reset password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
                            title="Edit user profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  placeholder="Search logs by user, bill header ID, or action..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="HANDOVER">Handover</option>
                <option value="ERP_SYNC">ERP Sync</option>
                <option value="CATEGORY_MAP_CREATE">Category Map</option>
                <option value="USER_CREATE">User Create</option>
                <option value="SETTINGS_UPDATE">Settings Update</option>
              </select>
            </div>

            <button
              onClick={handleExportAuditCsv}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 self-start sm:self-auto min-h-[38px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px] border-collapse">
                <thead className="bg-slate-100/80 text-slate-600 uppercase tracking-wider font-extrabold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-5">ID / Timestamp</th>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-5">Details / Description</th>
                    <th className="py-3.5 px-4">Header ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No audit logs matched your query.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.slice(0, 150).map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-5">
                          <span className="font-mono text-slate-400 text-[10px] block">#{log.id}</span>
                          <span className="text-[11px] text-slate-700">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-900">
                          {log.user_name}
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {log.user_role}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              log.action === 'LOGIN' || log.action === 'LOGOUT'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : log.action === 'HANDOVER'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : log.action === 'ERP_SYNC' || log.action === 'MANUAL_SYNC'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>

                        <td className="py-3 px-5 text-slate-800 text-xs">
                          {log.details}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-sky-700">
                          {log.header_id ? `#${log.header_id}` : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ERP SYNC CONFIGURATION */}
      {activeTab === 'sync' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Status & Controls */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Selsoft ERP API Integration Status
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live read-only GetBillsInward endpoint connection and automated polling parameters
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live API Active
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">API Endpoint URL:</span>
                  <span className="font-mono text-sky-700 font-bold text-[11px] truncate max-w-xs">
                    http://103.168.241.16/BillpassingApplication/api/approval/GetBillsInward
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Last Successful Sync:</span>
                  <span className="font-semibold text-slate-800">
                    {syncState.last_synced_at ? new Date(syncState.last_synced_at).toLocaleString() : 'Just now'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Next Scheduled Sync:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(syncState.next_sync_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Total Live Records Synchronized:</span>
                  <span className="font-black text-slate-900">{syncState.total_count} bills</span>
                </div>
              </div>

              {/* Sync Interval Adjuster */}
              <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-sky-900">
                  Automatic Sync Polling Interval
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={syncIntervalInput}
                    onChange={e => setSyncIntervalInput(Number(e.target.value))}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value={5}>Every 5 Minutes</option>
                    <option value={15}>Every 15 Minutes</option>
                    <option value={30}>Every 30 Minutes (Recommended)</option>
                    <option value={60}>Every 60 Minutes</option>
                  </select>

                  <button
                    onClick={handleSaveSyncInterval}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Save Interval
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Uses Selsoft <code className="font-mono text-sky-800">modifiedAfter</code> timestamp parameter to fetch incremental updates efficiently.
                </p>
              </div>

              <div className="pt-2">
                <button
                  disabled={isSyncingNow}
                  onClick={handleTriggerManualSync}
                  className="w-full py-3 bg-gradient-to-r from-slate-900 to-sky-950 hover:from-slate-800 hover:to-sky-900 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingNow ? 'animate-spin' : ''}`} />
                  <span>{isSyncingNow ? 'Syncing Live Selsoft Records...' : 'Trigger Full Live ERP Sync Now'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sync Errors & Info */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Database className="w-4 h-4 text-sky-600" />
              API Pagination & Deduplication
            </h3>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>HeaderId Matching:</strong> ERP records are deduplicated based on unique HeaderId keys to preserve historical notes and labels.
              </p>
              <p>
                <strong>Multi-page Handling:</strong> API pages are retrieved sequentially with <code className="font-mono text-slate-800">pagesize=50</code> until all pages are synchronized.
              </p>
              <p>
                <strong>Zero Stale Fallbacks:</strong> If upstream connection fails in production, an explicit sync alert is logged without silently replacing live bills.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit User */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-900">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingUserId ? 'Edit User Profile' : 'Create New User Account'}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Full Name / Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={e => setFormFullName(e.target.value)}
                  placeholder="e.g. SURIYA, VELUMANI"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Username / Login ID *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingUserId}
                  value={formUsername}
                  onChange={e => setFormUsername(e.target.value)}
                  placeholder="e.g. suriya, velumani"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500 disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={e => setFormDepartment(e.target.value as UserDepartment)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="PURCHASE">PURCHASE</option>
                    <option value="IAD">IAD</option>
                    <option value="AO">AO</option>
                    <option value="GM">GM</option>
                    <option value="JMD">JMD</option>
                    <option value="MD">MD</option>
                    <option value="SYSTEM ADMIN">SYSTEM ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    System Role
                  </label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="MD">MD</option>
                    <option value="ACCOUNTS">ACCOUNTS</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Access Level
                </label>
                <select
                  value={formAccessLevel}
                  onChange={e => setFormAccessLevel(e.target.value as AccessLevel)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                >
                  <option value="DEPARTMENT_ACCESS">Department Access (Staff/Standard)</option>
                  <option value="FULL_EDIT">Full Edit Access (JMD/MD/Auditor)</option>
                  <option value="FULL_ACCESS">Full System Admin (DFR_ADMIN)</option>
                </select>
              </div>

              {!editingUserId && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    value={formInitialPassword}
                    onChange={e => setFormInitialPassword(e.target.value)}
                    placeholder="Default: dfr@123"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  {editingUserId ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {isPasswordModalOpen && passwordTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-900">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900">
                Reset Password for {passwordTargetUser.full_name}
              </h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Confirm Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-sky-500 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-bold animate-in slide-in-from-bottom duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          {toastMessage}
        </div>
      )}
    </div>
  );
};
