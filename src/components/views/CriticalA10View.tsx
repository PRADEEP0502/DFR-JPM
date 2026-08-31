import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  User,
  Clock,
  IndianRupee,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Users,
  Search,
  Tag,
  Building2,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import { BillRegisterItem, DfrAlert, DfrUser, STAGE_DISPLAY_NAMES } from '../../types/dfr';

interface CriticalA10ViewProps {
  bills: BillRegisterItem[];
  alerts: DfrAlert[];
  currentUser: DfrUser;
  onSelectBill: (bill: BillRegisterItem) => void;
  onAcknowledgeAlert: (alertId: number) => void;
}

export const CriticalA10View: React.FC<CriticalA10ViewProps> = ({
  bills,
  alerts,
  onSelectBill,
  onAcknowledgeAlert,
}) => {
  const [searchFilter, setSearchFilter] = useState<string>('');

  const activeBills = bills.filter(
    b => b.bill_status !== 'PAID' && b.bill_status !== 'CLOSED' && b.dfr_status !== 'PAID'
  );

  const a3Threshold = activeBills.filter(b => b.age_days >= 3);
  const a5Threshold = activeBills.filter(b => b.age_days >= 5);
  const a10Bills = activeBills.filter(b => b.age_band === 'A-10' || b.age_days >= 10);
  
  const criticalAmount = a10Bills.reduce((sum, b) => sum + b.amount, 0);

  // Group Critical Bills by Current Holder
  const holderBreakdown: Record<string, { count: number; amount: number }> = {};
  a10Bills.forEach(b => {
    const holder = b.current_holder_name || 'Unassigned';
    if (!holderBreakdown[holder]) {
      holderBreakdown[holder] = { count: 0, amount: 0 };
    }
    holderBreakdown[holder].count += 1;
    holderBreakdown[holder].amount += b.amount;
  });

  const sortedHolders = Object.keys(holderBreakdown).sort(
    (a, b) => holderBreakdown[b].count - holderBreakdown[a].count
  );
  const maxHolderCount = Math.max(...Object.values(holderBreakdown).map(h => h.count), 1);

  // Filtered Critical Bills
  const filteredCriticalBills = a10Bills.filter(b => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      b.br_no.toLowerCase().includes(q) ||
      b.supplier.toLowerCase().includes(q) ||
      b.current_holder_name?.toLowerCase().includes(q) ||
      b.header_id.toString().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16 max-w-full overflow-hidden text-slate-900 font-sans">
      
      {/* Top 2 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* A-10 Critical Count */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600">
              A-10 CRITICAL COUNT
            </span>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-1.5 tracking-tight">
              {a10Bills.length} <span className="text-sm font-semibold text-slate-400">Bills</span>
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Pending ≥ 10 days from receipt date
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-black shadow-xs shrink-0">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* A-10 Critical Amount */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600">
              A-10 CRITICAL AMOUNT
            </span>
            <p className="text-3xl sm:text-4xl font-black text-rose-700 mt-1.5 tracking-tight">
              ₹{criticalAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              ₹{(criticalAmount / 100000).toFixed(2)} Lakhs Total Exposure
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-black shadow-xs shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytical Visual Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Chart 1: Pending Bills by Ageing Flag (Overlapping) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">
              Pending bills by ageing flag (overlapping)
            </h3>
            <span className="text-[11px] font-bold text-slate-400 font-mono">
              Total Active: {activeBills.length}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {/* A-3 Threshold */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-3">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase">
                A-3 (&gt;3d)
              </span>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-800">
                  {a3Threshold.length}
                </p>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${(a3Threshold.length / Math.max(activeBills.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* A-5 Threshold */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-3">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase">
                A-5 (&gt;5d)
              </span>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-800">
                  {a5Threshold.length}
                </p>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${(a5Threshold.length / Math.max(activeBills.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* A-10 Threshold */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col justify-between space-y-3">
              <span className="text-[11px] font-extrabold text-rose-600 uppercase">
                A-10 (&gt;10d)
              </span>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-rose-600">
                  {a10Bills.length}
                </p>
                <div className="w-full bg-rose-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-rose-600 h-full rounded-full animate-pulse"
                    style={{ width: `${(a10Bills.length / Math.max(activeBills.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Pending Bills by Current Holder (Horizontal Progress Bars) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">
              Pending bills by current holder
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {sortedHolders.length} Active Holders
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {sortedHolders.map(name => {
              const h = holderBreakdown[name];
              const pct = (h.count / maxHolderCount) * 100;
              return (
                <div key={name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 font-extrabold">{name}</span>
                    <span className="text-slate-600 font-mono">
                      {h.count} Bills (₹{(h.amount / 100000).toFixed(2)}L)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-teal-600 hover:bg-teal-500 transition-all duration-300 rounded-full h-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Critical Escalation Action Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Critical A-10 Action & Escalation List ({filteredCriticalBills.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any bill to view complete timeline, audit history, or perform custody transfer.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Search BR No, supplier, holder..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* High-Clarity Executive Critical Bill Cards */}
        {filteredCriticalBills.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No critical bills matched your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filteredCriticalBills.map(bill => {
              const alertObj = alerts.find(
                a => a.header_id === bill.header_id && a.band === 'A-10'
              );
              const isAcked = !!alertObj?.acknowledged_at;

              return (
                <div
                  key={bill.header_id}
                  onClick={() => onSelectBill(bill)}
                  className="bg-white border border-slate-200/90 hover:border-slate-400 rounded-2xl p-5 transition-all duration-200 cursor-pointer text-slate-900 shadow-2xs hover:shadow-md group flex flex-col justify-between space-y-4"
                >
                  {/* Top Bar: Clean BR Badge + Age Pill */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                        {bill.br_no}
                      </span>
                      <span className="text-xs font-mono text-slate-400 font-bold">
                        #{bill.header_id}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>{bill.age_days} Days Overdue</span>
                    </span>
                  </div>

                  {/* Supplier & Amount Row (Crisp separation) */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <h3 className="text-base font-black text-slate-900 group-hover:text-sky-700 transition truncate">
                        {bill.supplier}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Inv: <strong className="text-slate-700 font-semibold">{bill.bill_no}</strong> • BR Date: {bill.br_date}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-slate-900 font-mono tracking-tight">
                        ₹{bill.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Structured Details Matrix */}
                  <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
                      <span className="font-extrabold text-slate-800 truncate block mt-0.5">{bill.category}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Stage</span>
                      <span className="font-extrabold text-purple-700 truncate block mt-0.5">
                        {STAGE_DISPLAY_NAMES[bill.current_stage] || bill.current_stage}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Holder</span>
                      <span className="font-black text-sky-700 truncate block mt-0.5">{bill.current_holder_name}</span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div
                    className="pt-1 flex items-center justify-between"
                    onClick={e => e.stopPropagation()}
                  >
                    {isAcked ? (
                      <div className="w-full py-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Alert Acknowledged</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => alertObj && onAcknowledgeAlert(alertObj.id)}
                        className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-xl text-xs font-bold transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Acknowledge Alert</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
