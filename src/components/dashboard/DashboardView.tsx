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
  TrendingUp,
  ShieldAlert,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { BillRegisterItem, DfrUser, DfrAlert } from '../../types/dfr';
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
  users,
  alerts,
  currentUser,
  onSelectTab,
  onSelectBill,
  onAcknowledgeAlert,
}) => {
  // STRICT RULE: Dashboard KPI counts strictly ONLY include active pending bills (EXCLUDE PAID/CLOSED)
  const activeBills = bills.filter(b => b.dfr_status !== 'PAID' && b.dfr_status !== 'CLOSED');

  const totalPendingCount = activeBills.length;
  const totalPendingAmount = activeBills.reduce((sum, b) => sum + b.amount, 0);

  const a3Bills = activeBills.filter(b => b.age_band === 'A-3');
  const a5Bills = activeBills.filter(b => b.age_band === 'A-5');
  const a10Bills = activeBills.filter(b => b.age_band === 'A-10');

  const tallyPendingBills = activeBills.filter(b => !b.moved_to_tally);
  const tallyPendingAmount = tallyPendingBills.reduce((sum, b) => sum + b.amount, 0);

  const paymentPendingBills = activeBills.filter(b => b.moved_to_tally && b.payment_status !== 'COMPLETED');
  const paymentPendingAmount = paymentPendingBills.reduce((sum, b) => sum + b.amount, 0);

  // Group by Holder for Chart
  const holderMap: Record<string, number> = {};
  activeBills.forEach(b => {
    holderMap[b.current_holder_name] = (holderMap[b.current_holder_name] || 0) + 1;
  });
  const holderChartData = Object.keys(holderMap).map(name => ({
    name,
    bills: holderMap[name],
  }));

  // Group by Owner for Chart
  const ownerMap: Record<string, number> = {};
  activeBills.forEach(b => {
    ownerMap[b.owner_name] = (ownerMap[b.owner_name] || 0) + 1;
  });
  const ownerChartData = Object.keys(ownerMap).map(name => ({
    name,
    bills: ownerMap[name],
  }));

  // 3D Ageing Distribution Donut Data
  const ageDistributionData: Pie3DSlice[] = [
    { name: 'Normal (0-2d)', value: activeBills.filter(b => b.age_band === 'NORMAL').length, color: '#10b981', darkColor: '#047857' },
    { name: 'A-3 (3-4d)', value: a3Bills.length, color: '#eab308', darkColor: '#b45309' },
    { name: 'A-5 (5-9d)', value: a5Bills.length, color: '#f59e0b', darkColor: '#c2410c' },
    { name: 'A-10 (≥10d)', value: a10Bills.length, color: '#ef4444', darkColor: '#b91c1c' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* 3D Hero Executive Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-8 border border-sky-800/80 text-white shadow-2xl shadow-sky-950/40">
        {/* Background 3D Grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-500 to-sky-500 blur-sm opacity-70 animate-pulse" />
              <img
                src="/jpm_logo.jpg"
                alt="Junior Processing Mill"
                className="relative w-16 h-16 rounded-full object-cover border-2 border-white shadow-2xl p-0.5 bg-white shrink-0 transform-gpu hover:scale-105 transition"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Junior Processing Mill — Executive Dashboard
              </h1>
              <p className="text-sm text-sky-100/80 mt-1 max-w-xl">
                Real-time physical bill tracking, custody analytics, ageing alerts, and Tally/Payment pipeline
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

      {/* Row 1: 3D Elevating KPI Cards */}
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
          <p className="text-3xl font-black text-slate-900 mt-4 tracking-tight">{totalPendingCount}</p>
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
          <p className="text-xs text-slate-500 mt-1 font-semibold">₹{totalPendingAmount.toLocaleString('en-IN')}</p>
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
          <p className="text-3xl font-black text-yellow-600 mt-4 tracking-tight">{a3Bills.length}</p>
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
          <p className="text-3xl font-black text-amber-600 mt-4 tracking-tight">{a5Bills.length}</p>
          <p className="text-xs text-amber-700 mt-1 font-bold">Needs urgent push</p>
        </Card3D>

        {/* A-10 CRITICAL 3D Glowing Card */}
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
            <span className={`text-xs font-black uppercase tracking-wider ${a10Bills.length > 0 ? 'text-white' : 'text-red-700'}`}>
              A-10 Critical
            </span>
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-md ${
              a10Bills.length > 0 ? 'bg-white/20 backdrop-blur' : 'bg-gradient-to-br from-red-500 to-rose-700 shadow-red-500/40'
            }`}>
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-3xl font-black mt-4 tracking-tight ${a10Bills.length > 0 ? 'text-white' : 'text-red-600'}`}>
            {a10Bills.length}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className={`text-xs font-extrabold ${a10Bills.length > 0 ? 'text-red-100' : 'text-red-700'}`}>
              ≥ 10 Days Escalation
            </p>
            <ChevronRight className={`w-4 h-4 ${a10Bills.length > 0 ? 'text-white' : 'text-red-600'}`} />
          </div>
        </Card3D>
      </div>

      {/* Row 2: 3D Charts (Holder, Owner, Ageing Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Holder Workload Distribution Chart Card */}
        <Card3D noTilt={true} className="p-6" glowColor="rgba(2, 132, 199, 0.18)">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">3D Holder Workload Distribution</h3>
              <p className="text-xs text-slate-400">Isometric 3D column breakdown</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64 flex items-center justify-center pt-2">
            <BarChart3D data={holderChartData} colorScheme="blue" />
          </div>
        </Card3D>

        {/* 3D Owner (RP) Origin Chart Card */}
        <Card3D noTilt={true} className="p-6" glowColor="rgba(139, 92, 246, 0.18)">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">3D Responsible Person (RP) Origin</h3>
              <p className="text-xs text-slate-400">Isometric 3D column breakdown</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64 flex items-center justify-center pt-2">
            <BarChart3D data={ownerChartData} colorScheme="purple" />
          </div>
        </Card3D>

        {/* 3D Formatted Ageing Donut Chart Card */}
        <Card3D noTilt={true} className="p-6" glowColor="rgba(16, 185, 129, 0.2)">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">3D Ageing Band Distribution</h3>
              <p className="text-xs text-slate-400">Extruded 3D depth slice breakdown</p>
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

      {/* Row 3: Pipeline 3D Summary Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tally Pending Tile */}
        <Card3D
          glowColor="rgba(16, 185, 129, 0.2)"
          onClick={() => onSelectTab('tally')}
          className="p-6 group"
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
              <p className="text-xs text-slate-500">Bills received but not yet entered into Tally software</p>
              <div className="flex items-center gap-6 pt-3">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Pending Count</span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{tallyPendingBills.length} Bills</p>
                </div>
                <div className="border-l border-slate-200 pl-6">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Pending Value</span>
                  <p className="text-2xl font-black text-emerald-600 mt-0.5">
                    ₹{(tallyPendingAmount / 100000).toFixed(2)}L
                  </p>
                </div>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1.5 transition duration-200" />
          </div>
        </Card3D>

        {/* Payment Pending Tile */}
        <Card3D
          glowColor="rgba(99, 102, 241, 0.2)"
          onClick={() => onSelectTab('payment')}
          className="p-6 group"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition">
                  Payment Completion Pipeline
                </h3>
              </div>
              <p className="text-xs text-slate-500">Bills posted in Tally awaiting final bank disbursement</p>
              <div className="flex items-center gap-6 pt-3">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">In Tally Unpaid</span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{paymentPendingBills.length} Bills</p>
                </div>
                <div className="border-l border-slate-200 pl-6">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Payment Value</span>
                  <p className="text-2xl font-black text-indigo-600 mt-0.5">
                    ₹{(paymentPendingAmount / 100000).toFixed(2)}L
                  </p>
                </div>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1.5 transition duration-200" />
          </div>
        </Card3D>
      </div>

      {/* Row 4: 3D Critical (A-10) Urgent Action Panel */}
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
                Bills pending ≥ 10 days requiring immediate human acknowledgment and MD escalation
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
                  <th className="py-3 px-4">GB No</th>
                  <th className="py-3 px-4">Supplier Party</th>
                  <th className="py-3 px-4">Bill/DC No</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Current Custodian</th>
                  <th className="py-3 px-4">RP Owner</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4 text-right">Human Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {a10Bills.slice(0, 5).map(bill => {
                  const alertObj = alerts.find(a => a.gb_no === bill.gb_no && a.band === 'A-10');
                  const isAcked = !!alertObj?.acknowledged_at;

                  return (
                    <tr
                      key={bill.gb_no}
                      className="hover:bg-slate-50 transition cursor-pointer"
                      onClick={() => onSelectBill(bill)}
                    >
                      <td className="py-3.5 px-4 font-extrabold text-sky-600">GB #{bill.gb_no}</td>
                      <td className="py-3.5 px-4 text-slate-900 font-bold">{bill.party_name}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{bill.bill_dc_no}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{bill.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-sky-700 font-bold">{bill.current_holder_name}</td>
                      <td className="py-3.5 px-4 text-slate-500">{bill.owner_name}</td>
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
