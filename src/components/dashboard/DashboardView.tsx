import React from 'react';
import {
  FileText,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Users,
  Layers,
  ChevronRight,
  TrendingUp,
  CreditCard,
  IndianRupee,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calculator,
  UserCheck,
} from 'lucide-react';
import {
  BillRegisterItem,
  DfrUser,
  DfrAlert,
  ProcessStage,
  STAGE_DISPLAY_NAMES,
  AgeBand,
} from '../../types/dfr';
import { ViewTab } from '../layout/Sidebar';
import { Card3D } from '../ui/Card3D';
import { BarChart3D, Bar3DItem } from '../ui/BarChart3D';
import { PieChart3D, Pie3DSlice } from '../ui/PieChart3D';

interface DashboardViewProps {
  bills: BillRegisterItem[];
  users: DfrUser[];
  alerts: DfrAlert[];
  currentUser: DfrUser;
  onSelectTab: (tab: ViewTab) => void;
  onSelectBill: (bill: BillRegisterItem) => void;
  onAcknowledgeAlert: (alertId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  bills,
  users,
  alerts,
  currentUser,
  onSelectTab,
  onSelectBill,
  onAcknowledgeAlert,
}) => {
  // Filter active/open bills
  const activeBills = bills.filter(b => b.bill_status !== 'PAID' && b.bill_status !== 'CLOSED');

  // Strict Ageing metrics
  const normalBills = activeBills.filter(b => b.age_band === 'NORMAL');
  const a3Bills = activeBills.filter(b => b.age_band === 'A-3');
  const a5Bills = activeBills.filter(b => b.age_band === 'A-5');
  const a10Bills = activeBills.filter(b => b.age_band === 'A-10');

  const totalPendingAmount = activeBills.reduce((sum, b) => sum + b.amount, 0);
  const totalPendingCount = activeBills.length;
  const criticalPendingAmount = a10Bills.reduce((sum, b) => sum + b.amount, 0);

  // Tally stats
  const tallyPendingBills = activeBills.filter(
    b => b.tally_status === 'WAITING' || b.tally_status === 'PENDING'
  );
  const tallyPendingAmount = tallyPendingBills.reduce((sum, b) => sum + b.amount, 0);

  const tallyDoneBills = activeBills.filter(
    b => b.tally_status === 'EXPORTED' || b.tally_status === 'POSTED'
  );
  const tallyDoneAmount = tallyDoneBills.reduce((sum, b) => sum + b.amount, 0);

  // Group by Holder (All Active Custodians without hardcoded exclusions)
  const holderStats: Record<string, { count: number; amount: number; a10Count: number }> = {};
  
  activeBills.forEach(b => {
    const name = (b.current_holder_name || 'Unassigned').trim();
    if (name) {
      if (!holderStats[name]) {
        holderStats[name] = { count: 0, amount: 0, a10Count: 0 };
      }
      holderStats[name].count += 1;
      holderStats[name].amount += b.amount;
      if (b.age_band === 'A-10') {
        holderStats[name].a10Count += 1;
      }
    }
  });

  const sortedHolderNames = Object.keys(holderStats).sort(
    (a, b) => holderStats[b].count - holderStats[a].count
  );

  const holderChartData: Bar3DItem[] = sortedHolderNames.map(name => ({
    name,
    bills: holderStats[name].count,
  }));

  // Group by Process Stage
  const stageOrder: ProcessStage[] = ['BILL_INWARD', 'IAD', 'AO', 'JMD', 'ACCOUNTS'];
  const stageStats: Record<ProcessStage, { count: number; amount: number }> = {
    BILL_INWARD: { count: 0, amount: 0 },
    IAD: { count: 0, amount: 0 },
    AO: { count: 0, amount: 0 },
    JMD: { count: 0, amount: 0 },
    ACCOUNTS: { count: 0, amount: 0 },
    TALLY: { count: 0, amount: 0 },
  };

  activeBills.forEach(b => {
    if (b.current_stage === 'TALLY') {
      stageStats.ACCOUNTS.count++;
      stageStats.ACCOUNTS.amount += b.amount;
    } else if (stageStats[b.current_stage]) {
      stageStats[b.current_stage].count++;
      stageStats[b.current_stage].amount += b.amount;
    }
  });

  const stageChartData: Bar3DItem[] = stageOrder.map(st => ({
    name: STAGE_DISPLAY_NAMES[st],
    bills: stageStats[st].count,
  }));

  // 3D Ageing Distribution Donut Data
  const ageDistributionData: Pie3DSlice[] = [
    {
      name: 'Normal (0-2d)',
      value: normalBills.length,
      color: '#10b981',
      darkColor: '#047857',
    },
    { name: 'A-3 (3-4d)', value: a3Bills.length, color: '#eab308', darkColor: '#b45309' },
    { name: 'A-5 (5-9d)', value: a5Bills.length, color: '#f59e0b', darkColor: '#c2410c' },
    { name: 'A-10 (≥10d)', value: a10Bills.length, color: '#ef4444', darkColor: '#b91c1c' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 max-w-full overflow-hidden text-slate-900 font-sans">
      
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-4 sm:p-6 md:p-8 text-white shadow-2xl border border-sky-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-500/0 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src="/jpm_logo.jpg"
              alt="Junior Processing Mill"
              className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow-2xl p-0.5 bg-white shrink-0"
            />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
                Junior Processing Mill — Executive Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-sky-100/80 mt-1 max-w-xl">
                Real-time bill tracking from Bill Inward to Tally, BR Date ageing, and physical custody analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('register')}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-white hover:bg-sky-50 text-sky-950 rounded-xl sm:rounded-2xl font-black text-xs shadow-xl shadow-white/10 transition transform-gpu active:scale-95 flex items-center justify-center gap-2 min-h-[44px] touch-manipulation cursor-pointer"
            >
              <FileText className="w-4 h-4 text-sky-600" />
              Open Bill Register ({totalPendingCount})
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-5">
        {/* Total Pending Bills */}
        <Card3D glowColor="rgba(2, 132, 199, 0.2)" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Total Pending
            </span>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/30">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4 tracking-tight">
            {totalPendingCount}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Active bills in pipeline
          </p>
        </Card3D>

        {/* Total Pending Amount */}
        <Card3D glowColor="rgba(16, 185, 129, 0.2)" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Pending Amount
            </span>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4 tracking-tight">
            ₹{(totalPendingAmount / 100000).toFixed(2)}L
          </p>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            ₹{totalPendingAmount.toLocaleString('en-IN')} Total
          </p>
        </Card3D>

        {/* Normal (0-2d) */}
        <Card3D glowColor="rgba(16, 185, 129, 0.2)" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              Normal (0-2d)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-4 tracking-tight">
            {normalBills.length}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            {totalPendingCount > 0 ? ((normalBills.length / totalPendingCount) * 100).toFixed(1) : 0}% of active
          </p>
        </Card3D>

        {/* A-5 Warning Card */}
        <Card3D glowColor="rgba(245, 158, 11, 0.2)" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
              A-5 (5-9 Days)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 mt-4 tracking-tight">
            {a5Bills.length}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            Warning escalation zone
          </p>
        </Card3D>

        {/* A-10 CRITICAL Card */}
        <Card3D
          glowColor="rgba(239, 68, 68, 0.4)"
          onClick={() => onSelectTab('critical')}
          className={`p-5 transition cursor-pointer ${
            a10Bills.length > 0
              ? 'bg-gradient-to-br from-red-500 via-rose-600 to-red-700 text-white border-red-500 shadow-xl shadow-red-500/30'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-black uppercase tracking-wider ${
                a10Bills.length > 0 ? 'text-white' : 'text-red-700'
              }`}
            >
              A-10 Critical
            </span>
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-md ${
                a10Bills.length > 0
                  ? 'bg-white/20 backdrop-blur'
                  : 'bg-gradient-to-br from-red-500 to-rose-700 shadow-red-500/40'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-3xl font-black mt-4 tracking-tight ${
              a10Bills.length > 0 ? 'text-white' : 'text-red-600'
            }`}
          >
            {a10Bills.length}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p
              className={`text-xs font-extrabold ${
                a10Bills.length > 0 ? 'text-red-100' : 'text-red-700'
              }`}
            >
              ≥ 10 Days Escalation
            </p>
            <ChevronRight
              className={`w-4 h-4 ${a10Bills.length > 0 ? 'text-white' : 'text-red-600'}`}
            />
          </div>
        </Card3D>
      </div>

      {/* ========================================================================= */}
      {/* FULL-WIDTH ROW 1: PIPELINE STAGE DISTRIBUTION                             */}
      {/* ========================================================================= */}
      <Card3D noTilt={true} className="p-5 sm:p-7 shadow-sm border border-slate-200" glowColor="rgba(139, 92, 246, 0.15)">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Pipeline Stage Distribution
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 self-start sm:self-auto">
            <span>Total Active in Pipeline:</span>
            <span className="text-purple-700 font-extrabold">{totalPendingCount} Bills</span>
          </div>
        </div>

        {/* Dedicated 3D Bar Visualizer for Stages */}
        <div className="w-full pt-2">
          <BarChart3D data={stageChartData} colorScheme="purple" />
        </div>
      </Card3D>

      {/* ========================================================================= */}
      {/* FULL-WIDTH ROW 2: HOLDER WORKLOAD DISTRIBUTION                            */}
      {/* ========================================================================= */}
      <Card3D noTilt={true} className="p-5 sm:p-7 shadow-sm border border-slate-200" glowColor="rgba(2, 132, 199, 0.15)">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Holder Workload & Custody Distribution
              </h2>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('by_holder')}
            className="text-xs text-sky-600 font-bold hover:underline flex items-center gap-1 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-xl self-start sm:self-auto cursor-pointer"
          >
            View Holder Matrix
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dedicated 3D Bar Visualizer for Holders */}
        <div className="w-full pt-2">
          <BarChart3D data={holderChartData} colorScheme="blue" />
        </div>
      </Card3D>

      {/* ========================================================================= */}
      {/* FULL-WIDTH ROW 3: AGEING BAND DISTRIBUTION                                */}
      {/* ========================================================================= */}
      <Card3D noTilt={true} className="p-5 sm:p-7 shadow-sm border border-slate-200" glowColor="rgba(16, 185, 129, 0.15)">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Ageing Band Distribution (BR Date Basis)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200">
              {a10Bills.length} Critical A-10 Bills
            </span>
          </div>
        </div>

        {/* 3D Ageing Donut Chart */}
        <div className="w-full pt-2 flex items-center justify-center">
          <PieChart3D data={ageDistributionData} totalBills={totalPendingCount} />
        </div>
      </Card3D>

      {/* Row 4: Pipeline Tiles (Tally Posting & Payment Workflow) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Tally Pending Tile */}
        <Card3D
          glowColor="rgba(16, 185, 129, 0.2)"
          onClick={() => onSelectTab('tally')}
          className="p-4 sm:p-6 group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-600 transition">
                  Tally Posting Pipeline
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Bills awaiting export/posting into Tally software
              </p>
              <div className="flex items-center gap-6 pt-3">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">
                    Awaiting Tally
                  </span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    {tallyPendingBills.length} Bills
                  </p>
                </div>
                <div className="border-l border-slate-200 pl-6">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">
                    Pending Value
                  </span>
                  <p className="text-2xl font-black text-emerald-600 mt-0.5">
                    ₹{(tallyPendingAmount / 100000).toFixed(2)}L
                  </p>
                </div>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1.5 transition duration-200" />
          </div>
        </Card3D>

        {/* Tally Exported Tile */}
        <Card3D
          glowColor="rgba(99, 102, 241, 0.2)"
          onClick={() => onSelectTab('tally')}
          className="p-6 group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition">
                  Tally Exported & Accounts Pipeline
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Bills successfully exported to Tally awaiting final disbursement
              </p>
              <div className="flex items-center gap-6 pt-3">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">
                    Tally Exported
                  </span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    {tallyDoneBills.length} Bills
                  </p>
                </div>
                <div className="border-l border-slate-200 pl-6">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">
                    Exported Value
                  </span>
                  <p className="text-2xl font-black text-indigo-600 mt-0.5">
                    ₹{(tallyDoneAmount / 100000).toFixed(2)}L
                  </p>
                </div>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1.5 transition duration-200" />
          </div>
        </Card3D>
      </div>

      {/* Row 5: Critical (A-10) Urgent Action Table */}
      <Card3D glowColor="rgba(239, 68, 68, 0.25)" className="p-6 border-red-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white flex items-center justify-center font-bold shadow-lg shadow-red-500/30">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Critical (A-10) Urgent Escalation Table
              </h2>
              <p className="text-xs text-slate-500">
                Bills pending ≥ 10 days from BR Date requiring immediate action and MD escalation
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('critical')}
            className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl cursor-pointer"
          >
            View All Critical ({a10Bills.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {a10Bills.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <span>No critical A-10 bills pending! All bills are moving within normal limits.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Header ID</th>
                  <th className="py-3 px-4">BR No</th>
                  <th className="py-3 px-4">Supplier Party</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Current Holder</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Age (BR Date)</th>
                  <th className="py-3 px-4 text-right">Human Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {a10Bills.slice(0, 6).map(bill => {
                  const alertObj = alerts.find(
                    a => a.header_id === bill.header_id && a.band === 'A-10'
                  );
                  const isAcked = !!alertObj?.acknowledged_at;

                  return (
                    <tr
                      key={bill.header_id}
                      className="hover:bg-slate-50 transition cursor-pointer"
                      onClick={() => onSelectBill(bill)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                        #{bill.header_id}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-sky-600">
                        {bill.br_no}
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-bold">
                        {bill.supplier}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                          {bill.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{bill.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-sky-700 font-bold">
                        {bill.current_holder_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        {STAGE_DISPLAY_NAMES[bill.current_stage] || bill.current_stage}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 font-extrabold">
                          {bill.age_days} Days
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        {isAcked ? (
                          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg">
                            ✓ Acknowledged
                          </span>
                        ) : (
                          <button
                            onClick={() => alertObj && onAcknowledgeAlert(alertObj.id)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-[11px] rounded-xl shadow-md transition cursor-pointer"
                          >
                            Acknowledge Alert
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card3D>
    </div>
  );
};
