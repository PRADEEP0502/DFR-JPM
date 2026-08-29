import React, { useState, useEffect } from 'react';
import { Sidebar, ViewTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { BillRegisterView } from './components/register/BillRegisterView';
import { CriticalA10View } from './components/views/CriticalA10View';
import { ByHolderView } from './components/views/ByHolderView';
import { TallyTrackerView } from './components/views/TallyTrackerView';
import { LabelsManagerView } from './components/views/LabelsManagerView';
import { CategoryMappingView } from './components/views/CategoryMappingView';
import { ReportsView } from './components/views/ReportsView';
import { BillDetailDrawer } from './components/drawers/BillDetailDrawer';
import { HandoverModal } from './components/modals/HandoverModal';
import { dfrService } from './services/dfrService';
import { BillRegisterItem, DfrUser, ProcessStage } from './types/dfr';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const users = dfrService.getUsers();
  const [currentUser, setCurrentUser] = useState<DfrUser>(users[5] || users[0]); // Default JEYA SURIYA

  const [selectedBill, setSelectedBill] = useState<BillRegisterItem | null>(null);
  const [handoverBill, setHandoverBill] = useState<BillRegisterItem | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to service changes and trigger initial live sync
  const [, setTick] = useState(0);
  useEffect(() => {
    // Initial live sync from Selsoft ERP API
    dfrService.syncErpBillsNow(true);

    return dfrService.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  const bills = dfrService.getBillRegister(true);
  const labels = dfrService.getLabels();
  const alerts = dfrService.getAlerts();
  const syncState = dfrService.getSyncState();

  const criticalCount = bills.filter(
    b =>
      b.age_band === 'A-10' &&
      b.bill_status !== 'PAID' &&
      b.bill_status !== 'CLOSED' &&
      b.dfr_status !== 'PAID'
  ).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSyncNow = async () => {
    showToast('Triggering Selsoft ERP API GetBillsInward synchronization...');
    await dfrService.syncErpBillsNow();
    showToast('ERP Sync completed! Bill register updated.');
  };

  const handleConfirmHandover = (toHolderId: string, toStage: ProcessStage, note: string) => {
    if (!handoverBill) return;
    dfrService.confirmHandover(handoverBill.header_id, toHolderId, toStage, currentUser.id, note);
    showToast(`Custody of ${handoverBill.br_no} handed over successfully!`);
    setHandoverBill(null);
    setSelectedBill(null);
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleAcknowledgeAlert = (alertId: number) => {
    dfrService.acknowledgeAlert(alertId, currentUser.id);
    showToast('A-10 Critical alert acknowledged & logged.');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          setIsMobileMenuOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        criticalCount={criticalCount}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Right Content Panel */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header */}
        <TopBar
          currentUser={currentUser}
          users={users}
          onSwitchUser={setCurrentUser}
          syncState={syncState}
          onSyncNow={handleSyncNow}
          searchQuery={searchQuery}
          onSearchChange={q => {
            setSearchQuery(q);
            if (q.trim() && currentTab !== 'register') {
              setCurrentTab('register');
            }
          }}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
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
            />
          )}

          {currentTab === 'register' && (
            <BillRegisterView
              bills={bills}
              users={users}
              labels={labels}
              searchQuery={searchQuery}
              onSelectBill={setSelectedBill}
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
            />
          )}

          {currentTab === 'tally' && (
            <TallyTrackerView
              bills={bills}
              currentUser={currentUser}
              onSelectBill={setSelectedBill}
              onRefresh={() => setTick(t => t + 1)}
            />
          )}

          {currentTab === 'labels' && (
            <LabelsManagerView
              labels={labels}
              bills={bills}
              onRefresh={() => setTick(t => t + 1)}
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
