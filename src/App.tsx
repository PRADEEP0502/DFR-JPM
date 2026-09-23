import React, { useState, useEffect } from 'react';
import { Sidebar, ViewTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { BillRegisterView } from './components/register/BillRegisterView';
import { CriticalA10View } from './components/views/CriticalA10View';
import { ByHolderView } from './components/views/ByHolderView';
import { TallyTrackerView } from './components/views/TallyTrackerView';
import { FilingView } from './components/views/FilingView';
import { LabelsManagerView } from './components/views/LabelsManagerView';
import { CategoryMappingView } from './components/views/CategoryMappingView';
import { ReportsView } from './components/views/ReportsView';
import { ProcessFlowView } from './components/views/ProcessFlowView';
import { AdminSettingsView } from './components/views/AdminSettingsView';
import { LoginView } from './components/auth/LoginView';
import { BillDetailDrawer } from './components/drawers/BillDetailDrawer';
import { HandoverModal } from './components/modals/HandoverModal';
import { dfrService } from './services/dfrService';
import { authService, isTallyTrackerAuthorized, isAdminSettingsAuthorized } from './services/authService';
import { BillRegisterItem, DfrUser, ProcessStage } from './types/dfr';
import { ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [currentUser, setCurrentUser] = useState<DfrUser | null>(() => {
    const session = authService.restoreSession();
    return session ? session.user : null;
  });

  const [selectedBill, setSelectedBill] = useState<BillRegisterItem | null>(null);
  const [handoverBill, setHandoverBill] = useState<BillRegisterItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const [registerFilters, setRegisterFilters] = useState<{
    holder: string;
    stage: string;
    band: string;
    label: string;
    nonce: number;
  }>({
    holder: 'ALL',
    stage: 'ALL',
    band: 'ALL',
    label: 'ALL',
    nonce: 0,
  });

  const navigateToRegister = (
    filters: Partial<{ holder: string; stage: string; band: string; label: string }>
  ) => {
    setRegisterFilters(prev => ({
      holder: filters.holder !== undefined ? filters.holder : 'ALL',
      stage: filters.stage !== undefined ? filters.stage : 'ALL',
      band: filters.band !== undefined ? filters.band : 'ALL',
      label: filters.label !== undefined ? filters.label : 'ALL',
      nonce: prev.nonce + 1,
    }));
    setCurrentTab('register');
  };

  // Subscribe to service changes and trigger initial live sync
  const [, setTick] = useState(0);

  useEffect(() => {
    // Check and restore persistent authenticated session
    const session = authService.restoreSession();
    if (session) {
      setCurrentUser(session.user);
    }

    // Initial live sync from Selsoft ERP API
    dfrService.syncErpBillsNow(true);

    const handleWindowFocus = () => {
      dfrService.syncErpBillsNow(true).catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        dfrService.syncErpBillsNow(true).catch(() => {});
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const unsubDfr = dfrService.subscribe(() => {
      setTick(t => t + 1);
    });

    const unsubAuth = authService.subscribe(() => {
      const sess = authService.getCurrentSession();
      setCurrentUser(sess ? sess.user : null);
      setTick(t => t + 1);
    });

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubDfr();
      unsubAuth();
    };
  }, []);

  const users = dfrService.getUsers();
  const bills = dfrService.getBillRegister(true);
  const labels = dfrService.getLabels();
  const alerts = dfrService.getAlerts();
  const syncState = dfrService.getSyncState();

  const criticalCount = bills.filter(
    b =>
      b.age_band === 'A-10' &&
      b.bill_status !== 'PAID' &&
      b.bill_status !== 'CLOSED' &&
      b.dfr_status !== 'PAID' &&
      b.dfr_status !== 'TALLY_DONE' &&
      b.tally_status !== 'EXPORTED' &&
      b.tally_status !== 'POSTED'
  ).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSyncNow = async () => {
    showToast('Fetching latest live data from Selsoft ERP...');
    try {
      const state = await dfrService.syncErpBillsNow(true);
      if (state.last_error) {
        showToast(`Sync warning: ${state.last_error}`);
      } else {
        showToast(`Live ERP Sync successful! ${state.total_count} bills updated.`);
      }
    } catch (err: any) {
      showToast(`Sync failed: ${err.message || 'ERP connection error'}`);
    }
  };

  const handleConfirmHandover = (toHolderId: string, toStage: ProcessStage, note: string) => {
    if (!handoverBill || !currentUser) return;
    dfrService.confirmHandover(handoverBill.header_id, toHolderId, toStage, currentUser.id, note);
    showToast(`Custody of ${handoverBill.br_no} handed over successfully!`);
    setHandoverBill(null);
    setSelectedBill(null);
  };

  const handleAcknowledgeAlert = (alertId: number) => {
    if (!currentUser) return;
    dfrService.acknowledgeAlert(alertId, currentUser.id);
    showToast('A-10 Critical alert acknowledged & logged.');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    showToast('You have been signed out.');
  };

  // If user is not authenticated, render Login View
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={user => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.full_name}!`);
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={tab => {
          if (tab === 'tally' && !isTallyTrackerAuthorized(currentUser)) {
            showToast('Access Denied: Tally Tracker is restricted to authorized accounts only.');
            setCurrentTab('dashboard');
            return;
          }
          if (tab === 'settings' && !isAdminSettingsAuthorized(currentUser)) {
            showToast('Access Denied: Admin Settings & Audit Logs are restricted to MD, JMD, MD_MAM, and DFR_ADMIN only.');
            setCurrentTab('dashboard');
            return;
          }
          setCurrentTab(tab);
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsSidebarOpen(false);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        criticalCount={criticalCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Right Content Panel */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header */}
        <TopBar
          currentUser={currentUser}
          users={users}
          onSwitchUser={u => {
            setCurrentUser(u);
            if (currentTab === 'tally' && !isTallyTrackerAuthorized(u)) {
              setCurrentTab('dashboard');
              showToast(`Switched to ${u.full_name}. Tally Tracker restricted.`);
            }
            if (currentTab === 'settings' && !isAdminSettingsAuthorized(u)) {
              setCurrentTab('dashboard');
              showToast(`Switched to ${u.full_name}. Admin Settings restricted.`);
            }
          }}
          syncState={syncState}
          onSyncNow={handleSyncNow}
          searchQuery={searchQuery}
          onLogout={handleLogout}
          onSearchChange={q => {
            setSearchQuery(q);
            if (q.trim() && currentTab !== 'register') {
              setCurrentTab('register');
            }
          }}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />

        {/* View Switcher Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-6 lg:p-8 min-w-0">
          {currentTab === 'dashboard' && (
            <DashboardView
              bills={bills}
              users={users}
              alerts={alerts}
              currentUser={currentUser}
              onSelectTab={setCurrentTab}
              onSelectBill={setSelectedBill}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onSelectHolder={holderId => navigateToRegister({ holder: holderId })}
              onSelectStage={stage => navigateToRegister({ stage: stage })}
              onSelectBand={band => navigateToRegister({ band: band })}
            />
          )}

          {currentTab === 'register' && (
            <BillRegisterView
              bills={bills}
              users={users}
              labels={labels}
              searchQuery={searchQuery}
              onSelectBill={setSelectedBill}
              initialLabelFilter={registerFilters.label}
              initialHolderFilter={registerFilters.holder}
              initialStageFilter={registerFilters.stage}
              initialBandFilter={registerFilters.band}
              filterNonce={registerFilters.nonce}
            />
          )}

          {currentTab === 'critical' && (
            <CriticalA10View
              bills={bills}
              alerts={alerts}
              currentUser={currentUser}
              onSelectBill={setSelectedBill}
              onAcknowledgeAlert={handleAcknowledgeAlert}
            />
          )}

          {currentTab === 'by_holder' && (
            <ByHolderView
              bills={bills}
              users={users}
              onSelectTab={setCurrentTab}
              onSelectBill={setSelectedBill}
              onSelectHolder={holderId => navigateToRegister({ holder: holderId })}
            />
          )}

          {currentTab === 'tally' && (
            isTallyTrackerAuthorized(currentUser) ? (
              <TallyTrackerView
                bills={bills}
                currentUser={currentUser}
                onSelectBill={setSelectedBill}
                onRefresh={() => setTick(t => t + 1)}
              />
            ) : (
              <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-sm max-w-lg mx-auto my-12 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Access Denied</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Tally Tracker access is strictly restricted to <strong>ACCOUNTS, JMD, MD, MD_MAM,</strong> and <strong>DFR_ADMIN</strong> user accounts only.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            )
          )}

          {currentTab === 'filing' && (
            <FilingView
              bills={bills}
              currentUser={currentUser}
              onSelectBill={setSelectedBill}
              onRefresh={() => setTick(t => t + 1)}
            />
          )}

          {currentTab === 'process_flow' && <ProcessFlowView />}

          {currentTab === 'labels' && (
            <LabelsManagerView
              labels={labels}
              bills={bills}
              onRefresh={() => setTick(t => t + 1)}
              onSelectLabel={labelId => navigateToRegister({ label: labelId })}
            />
          )}

          {currentTab === 'category_mapping' && (
            <CategoryMappingView
              mappings={dfrService.getCategoryMappings()}
              users={users}
              onRefresh={() => setTick(t => t + 1)}
            />
          )}

          {currentTab === 'reports' && <ReportsView bills={bills} users={users} />}

          {currentTab === 'settings' && (
            isAdminSettingsAuthorized(currentUser) ? (
              <AdminSettingsView
                currentUser={currentUser}
                onRefresh={() => setTick(t => t + 1)}
              />
            ) : (
              <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-sm max-w-lg mx-auto my-12 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Access Denied</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Admin Settings & Audit Logs are strictly restricted to <strong>MD, JMD, MD_MAM,</strong> and <strong>DFR_ADMIN</strong> user accounts only.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            )
          )}
        </main>
      </div>

      {/* Bill Detail Drawer */}
      {selectedBill && (
        <BillDetailDrawer
          bill={bills.find(b => b.header_id === selectedBill.header_id) || selectedBill}
          users={users}
          labels={labels}
          currentUser={currentUser}
          onClose={() => setSelectedBill(null)}
          onOpenHandover={() => {
            setHandoverBill(selectedBill);
          }}
          onRefresh={() => setTick(t => t + 1)}
        />
      )}

      {/* Handover Checkpoint Modal */}
      {handoverBill && (
        <HandoverModal
          bill={handoverBill}
          users={users}
          currentUser={currentUser}
          onClose={() => setHandoverBill(null)}
          onConfirm={handleConfirmHandover}
        />
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
