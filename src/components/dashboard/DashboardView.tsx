import React from 'react';
import {
  FileText,
  IndianRupee,
  Clock,
  AlertOctagon,
  AlertTriangle,
  Calculator,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  BillRegisterItem,
  DfrUser,
  DfrAlert,
  ProcessStage,
  STAGE_DISPLAY_NAMES,
} from '../../types/dfr';
import { ViewTab } from '../layout/Sidebar';
import { Card3D } from '../ui/Card3D';
import { PieChart3D, Pie3DSlice } from '../ui/PieChart3D';
import { BarChart3D, Bar3DItem } from '../ui/BarChart3D';

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
  alerts,
  onSelectTab,
  onSelectBill,
  onAcknowledgeAlert,
}) => {
  // STRICT RULE: Dashboard KPI counts strictly ONLY include active pending bills (EXCLUDE PAID/CLOSED)
  const activeBills = bills.filter(
    b => b.bill_status !== 'PAID' && b.bill_status !== 'CLOSED' && b.dfr_status !== 'PAID'
  );

  const totalPendingCount = activeBills.length;
  const totalPendingAmount = activeBills.reduce((sum, b) => sum + b.amount, 0);

  const a3Bills = activeBills.filter(b => b.age_band === 'A-3');
  const a5Bills = activeBills.filter(b => b.age_band === 'A-5');
  const a10Bills = activeBills.filter(b => b.age_band === 'A-10');

  const tallyPendingBills = activeBills.filter(
    b => b.tally_status !== 'EXPORTED' && b.tally_status !== 'POSTED'
  );
  const tallyPendingAmount = tallyPendingBills.reduce((sum, b) => sum + b.amount, 0);

  const tallyDoneBills = activeBills.filter(
    b => b.tally_status === 'EXPORTED' || b.tally_status === 'POSTED'
  );
  const tallyDoneAmount = tallyDoneBills.reduce((sum, b) => sum + b.amount, 0);

  // Group by Holder for 3D Bar Chart
  const holderMap: Record<string, number> = {};
  activeBills.forEach(b => {
    holderMap[b.current_holder_name] = (holderMap[b.current_holder_name] || 0) + 1;
  });
  const holderChartData: Bar3DItem[] = Object.keys(holderMap).map(name => ({
    name,
    bills: holderMap[name],
  }));

  // Group by Current Stage for 3D Bar Chart (Bill Inward → IAD → AO → JMD → Accounts / Tally)
  const stageOrder: ProcessStage[] = ['BILL_INWARD', 'IAD', 'AO', 'JMD', 'ACCOUNTS'];
  const stageMap: Record<ProcessStage, number> = {
    BILL_INWARD: 0,
    IAD: 0,
    AO: 0,
    JMD: 0,
    ACCOUNTS: 0,
    TALLY: 0,
  };
  activeBills.forEach(b => {
    if (b.current_stage === 'TALLY') {
      stageMap.ACCOUNTS++;
    } else if (stageMap[b.current_stage] !== undefined) {
      stageMap[b.current_stage]++;
    }
  });

  const stageChartData: Bar3DItem[] = stageOrder.map(st => ({
    name: STAGE_DISPLAY_NAMES[st],
    bills: stageMap[st],
  }));

  // 3D Ageing Distribution Donut Data (strictly from BRDate)
  const ageDistributionData: Pie3DSlice[] = [
    {
      name: 'Normal (0-2d)',
      value: activeBills.filter(b => b.age_band === 'NORMAL').length,
      color: '#10b981',
      darkColor: '#047857',
    },
    { name: 'A-3 (3-4d)', value: a3Bills.length, color: '#eab308', darkColor: '#b45309' },
    { name: 'A-5 (5-9d)', value: a5Bills.length, color: '#f59e0b', darkColor: '#c2410c' },
    { name: 'A-10 (≥10d)', value: a10Bills.length, color: '#ef4444', darkColor: '#b91c1c' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-8 border border-sky-800/80 text-white shadow-2xl shadow-sky-950/40">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src="/jpm_logo.jpg"
              alt="Junior Processing Mill"
              className="relative w-16 h-16 rounded-full object-cover border-2 border-white shadow-2xl p-0.5 bg-white shrink-0"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Junior Processing Mill — Executive Dashboard
              </h1>
              <p className="text-sm text-sky-100/80 mt-1 max-w-xl">
                Real-time bill tracking from Bill Inward to Tally, BR Date ageing, and physical custody analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('register')}
              className="px-5 py-2.5 bg-white hover:bg-sky-50 text-sky-950 rounded-2xl font-black text-xs shadow-xl shadow-white/10 transition transform-gpu hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-sky-600" />
              Open Bill Register ({totalPendingCount})
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
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
          <p className="text-3xl font-black text-emerald-600 mt-4 tracking-tight">
            ₹{(totalPendingAmount / 100000).toFixed(2)}L
          </p>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            ₹{totalPendingAmount.toLocaleString('en-IN')}
          </p>
        </Card3D>

        {/* A-3 Early Warning */}
        <Card3D glowColor="rgba(234, 179, 8, 0.2)" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-yellow-700">
              A-3 (3–4 Days)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-md shadow-yellow-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-yellow-600 mt-4 tracking-tight">
            {a3Bills.length}
          </p>
          <p className="text-xs text-yellow-700 mt-1 font-bold">Early follow-up band</p>
        </Card3D>

        {/* A-5 Follow-Up */}
        <Card3D glowColor="rgba(245, 158, 11, 0.25)" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
              A-5 (5–9 Days)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 mt-4 tracking-tight">
            {a5Bills.length}
          </p>
          <p className="text-xs text-amber-700 mt-1 font-bold">Needs urgent push</p>
        </Card3D>

        {/* A-10 CRITICAL Card */}
        <Card3D
          glowColor="rgba(239, 68, 68, 0.4)"
          onClick={() => onSelectTab('critical')}
          className={`p-5 transition ${
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

      {/* Row 2: 3D Charts (Holder Workload, Stage Distribution, Ageing Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holder Workload Distribution */}
        <Card3D noTilt={true} className="p-6" glowColor="rgba(2, 132, 199, 0.18)">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Holder Workload Distribution</h3>
              <p className="text-xs text-slate-400">Bills currently held per person</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64 flex items-center justify-center pt-2">
            <BarChart3D data={holderChartData} colorScheme="blue" />
          </div>
        </Card3D>

        {/* Current Stage Pipeline Distribution (Bill Inward to Tally) */}
        <Card3D noTilt={true} className="p-6" glowColor="rgba(139, 92, 246, 0.18)">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Pipeline Stage Distribution</h3>
              <p className="text-xs text-slate-400">Bill Inward → IAD → AO → JMD → Accounts → Tally</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64 flex items-center justify-center pt-2">
            <BarChart3D data={stageChartData} colorScheme="purple" />
          </div>
        </Card3D>

        {/* Ageing Band Distribution (BR Date) */}
        <Card3D noTilt={true} className="p-6" glowColor="rgba(16, 185, 129, 0.2)">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Ageing Band Distribution</h3>
              <p className="text-xs text-slate-400">Based strictly on BR Date</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64 flex items-center justify-center pt-2">
            <PieChart3D data={ageDistributionData} totalBills={totalPendingCount} />
          </div>
        </Card3D>
      </div>

      {/* Row 3: Pipeline Tiles (Tally & Payment/Posting) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tally Pending Tile */}
        <Card3D
          glowColor="rgba(16, 185, 129, 0.2)"
          onClick={() => onSelectTab('tally')}
          className="p-6 group cursor-pointer"
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

      {/* Row 4: Critical (A-10) Urgent Action Table */}
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
            className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl"
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
            <table className="w-full text-left text-xs">
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
                            className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-[11px] rounded-xl shadow-md transition"
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
