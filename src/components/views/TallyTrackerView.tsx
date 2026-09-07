import React, { useState, useMemo } from 'react';
import {
  Calculator,
  CheckCircle2,
  IndianRupee,
  Clock,
  ArrowRight,
  Send,
  FileCheck,
  Building2,
  Calendar,
  Search,
  Check,
  Download,
  Filter,
  History,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BillRegisterItem, DfrUser, STAGE_DISPLAY_NAMES } from '../../types/dfr';
import { dfrService } from '../../services/dfrService';

const formatDateOnly = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  let str = dateStr.trim();
  if (str.includes('T')) str = str.split('T')[0];
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const [p1, p2, p3] = parts;
      if (p3.length === 4) {
        return `${p1.padStart(2, '0')}/${p2.padStart(2, '0')}/${p3}`;
      } else if (p1.length === 4) {
        return `${p3.padStart(2, '0')}/${p2.padStart(2, '0')}/${p1}`;
      }
    }
  }
  const parts = str.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

// Helper to parse date safely
const parseDateSafe = (dateStr?: string | null): Date | null => {
  if (!dateStr) return null;
  let str = dateStr.trim();
  if (str.includes('T')) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const [p1, p2, p3] = parts;
      if (p3.length === 4) {
        const d = new Date(Number(p3), Number(p2) - 1, Number(p1));
        return isNaN(d.getTime()) ? null : d;
      }
      if (p1.length === 4) {
        const d = new Date(Number(p1), Number(p2) - 1, Number(p3));
        return isNaN(d.getTime()) ? null : d;
      }
    }
  }
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      if (y.length === 4) {
        const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
        return isNaN(dateObj.getTime()) ? null : dateObj;
      }
    }
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Returns Indian Financial Year string (e.g. "2026-27") for a given date
 * JPM Financial Year: April 1 to March 31
 */
const getFinancialYearForDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1; // 1 to 12
  if (m >= 4) {
    // April - December: Start Year is y, End Year is y + 1
    const endShort = String((y + 1) % 100).padStart(2, '0');
    return `${y}-${endShort}`;
  } else {
    // January - March: Start Year is y - 1, End Year is y
    const startYear = y - 1;
    const endShort = String(y % 100).padStart(2, '0');
    return `${startYear}-${endShort}`;
  }
};

interface TallyTrackerViewProps {
  bills: BillRegisterItem[];
  currentUser: DfrUser;
  onSelectBill: (bill: BillRegisterItem) => void;
  onRefresh: () => void;
}

type TallyTab = 'awaiting' | 'exported' | 'history';

interface MonthSummary {
  monthIndex: number; // 0 (April) to 11 (March)
  monthName: string; // e.g. "April"
  fullLabel: string; // e.g. "April 2026"
  year: number; // e.g. 2026
  monthNum: number; // 1 to 12
  bills: BillRegisterItem[];
  count: number;
  totalAmount: number;
}

const MONTH_NAMES = [
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
  'January',
  'February',
  'March',
];

export const TallyTrackerView: React.FC<TallyTrackerViewProps> = ({
  bills,
  currentUser,
  onSelectBill,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<TallyTab>('awaiting');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedHeaderId, setSelectedHeaderId] = useState<number | null>(null);
  const [note, setNote] = useState<string>('');

  // Year-wise Monthly History States
  const [selectedFy, setSelectedFy] = useState<string>('2026-27');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const [historySearch, setHistorySearch] = useState<string>('');

  const isExported = (b: BillRegisterItem): boolean => {
    const status = (b.tally_status || '').toUpperCase().trim();
    const dfr = (b.dfr_status || '').toUpperCase().trim();
    const bill = (b.bill_status || '').toUpperCase().trim();

    if (status.includes('WAITING') || status.includes('PENDING') || status === 'OPEN') {
      return false;
    }

    return (
      status === 'EXPORTED' ||
      status === 'POSTED' ||
      dfr === 'TALLY_DONE' ||
      dfr === 'PAID' ||
      bill === 'PAID' ||
      bill === 'CLOSED' ||
      Boolean(b.tally_exported_date)
    );
  };

  // 1. Awaiting Tally Export (Active pending bills)
  const awaitingBills = useMemo(() => bills.filter(b => !isExported(b)), [bills]);

  // 2. Exported to Tally (Completed bills)
  const exportedBills = useMemo(() => bills.filter(b => isExported(b)), [bills]);

  const awaitingAmount = useMemo(
    () => awaitingBills.reduce((sum, b) => sum + b.amount, 0),
    [awaitingBills]
  );
  const exportedAmount = useMemo(
    () => exportedBills.reduce((sum, b) => sum + b.amount, 0),
    [exportedBills]
  );

  // Available Financial Years extracted from exported dataset + current default
  const availableFinancialYears = useMemo(() => {
    const fySet = new Set<string>(['2026-27', '2025-26']);
    exportedBills.forEach(b => {
      const d = parseDateSafe(b.tally_exported_date);
      if (d) {
        fySet.add(getFinancialYearForDate(d));
      }
    });
    return Array.from(fySet).sort().reverse();
  }, [exportedBills]);

  // Monthly breakdown for selected Financial Year (April to March)
  const fyMonthlySummary = useMemo(() => {
    const [startYearStr] = selectedFy.split('-');
    const startYear = parseInt(startYearStr, 10) || 2026;

    // Create 12 month buckets (April to March)
    const months: MonthSummary[] = MONTH_NAMES.map((name, idx) => {
      const isNextYear = idx >= 9;
      const year = isNextYear ? startYear + 1 : startYear;
      const monthNum = isNextYear ? idx - 8 : idx + 4; // 1 to 12

      return {
        monthIndex: idx,
        monthName: name,
        fullLabel: `${name} ${year}`,
        year,
        monthNum,
        bills: [],
        count: 0,
        totalAmount: 0,
      };
    });

    // Populate with exported bills based strictly on tally_exported_date
    exportedBills.forEach(b => {
      const dateObj = parseDateSafe(b.tally_exported_date);
      if (!dateObj) return;

      const billFy = getFinancialYearForDate(dateObj);
      if (billFy !== selectedFy) return;

      const y = dateObj.getFullYear();
      const m = dateObj.getMonth() + 1; // 1-12

      const targetBucket = months.find(bucket => bucket.year === y && bucket.monthNum === m);
      if (targetBucket) {
        targetBucket.bills.push(b);
        targetBucket.count += 1;
        targetBucket.totalAmount += b.amount;
      }
    });

    return months;
  }, [selectedFy, exportedBills]);

  // Financial Year totals
  const fyTotalCount = useMemo(
    () => fyMonthlySummary.reduce((sum, m) => sum + m.count, 0),
    [fyMonthlySummary]
  );
  const fyTotalAmount = useMemo(
    () => fyMonthlySummary.reduce((sum, m) => sum + m.totalAmount, 0),
    [fyMonthlySummary]
  );
  const avgPerMonthCount = useMemo(
    () => (fyTotalCount > 0 ? Math.round(fyTotalCount / 12) : 0),
    [fyTotalCount]
  );
  const peakMonth = useMemo(() => {
    let peak = fyMonthlySummary[0];
    fyMonthlySummary.forEach(m => {
      if (m.count > (peak?.count || 0)) peak = m;
    });
    return peak;
  }, [fyMonthlySummary]);

  // Selected Month's bills for drilldown
  const activeMonthData = useMemo(() => {
    if (selectedMonthIndex === null) {
      const firstWithData = fyMonthlySummary.find(m => m.count > 0);
      return firstWithData || fyMonthlySummary[5]; // Default to first with data or September
    }
    return fyMonthlySummary[selectedMonthIndex] || fyMonthlySummary[0];
  }, [selectedMonthIndex, fyMonthlySummary]);

  // Filtered bills in the drilldown list
  const filteredMonthBills = useMemo(() => {
    if (!activeMonthData) return [];
    if (!historySearch.trim()) return activeMonthData.bills;
    const q = historySearch.toLowerCase();
    return activeMonthData.bills.filter(
      b =>
        b.br_no.toLowerCase().includes(q) ||
        b.bill_no.toLowerCase().includes(q) ||
        b.supplier.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.header_id.toString().includes(q) ||
        (b.current_holder_name && b.current_holder_name.toLowerCase().includes(q))
    );
  }, [activeMonthData, historySearch]);

  const handleMarkTally = (headerId: number) => {
    dfrService.markMovedToTally(headerId, currentUser.id, note);
    setSelectedHeaderId(null);
    setNote('');
    onRefresh();
  };

  // Export CSV for the selected month
  const handleExportMonthCsv = () => {
    if (!activeMonthData || activeMonthData.bills.length === 0) return;

    const headers = [
      'Header ID',
      'BR No',
      'BR Date',
      'Bill No',
      'Bill Date',
      'Supplier',
      'Amount (INR)',
      'Category',
      'Current Holder',
      'Tally Exported Date',
      'Status',
    ];

    const rows = activeMonthData.bills.map(b => [
      b.header_id,
      `"${b.br_no}"`,
      `"${formatDateOnly(b.br_date)}"`,
      `"${b.bill_no}"`,
      `"${formatDateOnly(b.bill_date)}"`,
      `"${b.supplier.replace(/"/g, '""')}"`,
      b.amount,
      `"${b.category}"`,
      `"${b.current_holder_name || ''}"`,
      `"${formatDateOnly(b.tally_exported_date)}"`,
      `"EXPORTED"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `dfr_tally_completed_FY${selectedFy}_${activeMonthData.monthName}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Regular filtered bills for Awaiting / Exported tab
  const currentList = activeTab === 'awaiting' ? awaitingBills : exportedBills;
  const filteredBills = currentList.filter(b => {
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
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-500/80 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white text-emerald-700 flex items-center justify-center font-black shadow-lg shrink-0">
            <Calculator className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Tally Posting & Completion Tracker
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-emerald-950 border border-emerald-300">
                Enterprise Accounts
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 font-medium">
              Real-time pipeline tracking from ERP Selsoft to Tally software, year-wise historical analytics, and completion records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-5 py-2.5 text-left md:text-right shrink-0 shadow-xs">
            <span className="text-[10px] text-emerald-200 font-extrabold uppercase tracking-wider block">
              Awaiting Export Value
            </span>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">
              ₹{awaitingAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Interactive Section Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Tab 1: Waiting for Tally */}
        <div
          onClick={() => setActiveTab('awaiting')}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer shadow-xs ${
            activeTab === 'awaiting'
              ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/20 shadow-md'
              : 'bg-white border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              1. Waiting for Tally
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-full text-xs">
              {awaitingBills.length}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono">
            ₹{(awaitingAmount / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Active bills pending handover to Accounts / Tally
          </p>
        </div>

        {/* Tab 2: Exported to Tally */}
        <div
          onClick={() => setActiveTab('exported')}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer shadow-xs ${
            activeTab === 'exported'
              ? 'bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-500/20 shadow-md'
              : 'bg-white border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              2. Exported to Tally
            </span>
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-extrabold rounded-full text-xs">
              {exportedBills.length}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono">
            ₹{(exportedAmount / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Completed & Exported bills pipeline
          </p>
        </div>

        {/* Tab 3: Year-wise Monthly Completion History */}
        <div
          onClick={() => setActiveTab('history')}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer shadow-xs ${
            activeTab === 'history'
              ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-500/20 shadow-md'
              : 'bg-white border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-sky-600" />
              3. Monthly History
            </span>
            <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 font-extrabold rounded-full text-xs">
              FY {selectedFy}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono">
            {fyTotalCount} Bills
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            April to March Year-wise Monthly Analytics
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1 & 2: AWAITING OR EXPORTED PIPELINE LIST */}
      {/* ========================================================================= */}
      {(activeTab === 'awaiting' || activeTab === 'exported') && (
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs space-y-4 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                {activeTab === 'awaiting' && <Clock className="w-5 h-5 text-emerald-600" />}
                {activeTab === 'exported' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                {activeTab === 'awaiting' && `Bills Waiting for Tally (${filteredBills.length})`}
                {activeTab === 'exported' && `Bills Exported to Tally (${filteredBills.length})`}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === 'exported' &&
                  'Exported bills have been successfully posted into Tally software and completed.'}
                {activeTab === 'awaiting' &&
                  'Click Move to Tally to transition active bills into completed Tally status.'}
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search BR No, supplier..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[950px]">
              <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Header ID</th>
                  <th className="py-3 px-4 whitespace-nowrap">BR No</th>
                  <th className="py-3 px-4 whitespace-nowrap">Supplier Party</th>
                  <th className="py-3 px-4 whitespace-nowrap">Category</th>
                  <th className="py-3 px-4 whitespace-nowrap">Amount</th>
                  <th className="py-3 px-4 whitespace-nowrap">Tally Status</th>
                  <th className="py-3 px-4 whitespace-nowrap">Export Date</th>
                  <th className="py-3 px-4 whitespace-nowrap">Age (BR Date)</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Checkpoint Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      No bills found in this Tally pipeline status.
                    </td>
                  </tr>
                ) : (
                  filteredBills.map(b => (
                    <tr
                      key={b.header_id}
                      onClick={() => onSelectBill(b)}
                      className="hover:bg-slate-50 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500 whitespace-nowrap">
                        #{b.header_id}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-sky-700 font-mono whitespace-nowrap">
                        {b.br_no}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{b.supplier}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200 shadow-2xs leading-normal">
                          {b.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 font-mono whitespace-nowrap">
                        ₹{b.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap ${
                            isExported(b)
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isExported(b) ? 'EXPORTED' : 'WAITING'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                        {isExported(b) && b.tally_exported_date ? formatDateOnly(b.tally_exported_date) : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                        {isExported(b) ? '—' : `${b.age_days} Days`}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        {activeTab === 'awaiting' && (
                          <div>
                            {selectedHeaderId === b.header_id ? (
                              <div className="flex items-center justify-end gap-2">
                                <input
                                  type="text"
                                  placeholder="Voucher note..."
                                  value={note}
                                  onChange={e => setNote(e.target.value)}
                                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-[11px] text-slate-900 focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                  onClick={() => handleMarkTally(b.header_id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition shadow-xs cursor-pointer"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setSelectedHeaderId(null)}
                                  className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedHeaderId(b.header_id)}
                                className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold text-[11px] rounded-xl transition flex items-center gap-1.5 ml-auto cursor-pointer"
                              >
                                <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                                Move to Tally
                              </button>
                            )}
                          </div>
                        )}

                        {activeTab === 'exported' && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Exported & Closed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: YEAR-WISE MONTHLY COMPLETION HISTORY (APRIL TO MARCH) */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Financial Year Selector & Control Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold border border-sky-200 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Financial Year: <span className="text-sky-700">FY {selectedFy}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  JPM Cycle: April 1, {selectedFy.split('-')[0]} &rarr; March 31, 20{selectedFy.split('-')[1]} • Completion based on Tally Export Date
                </p>
              </div>
            </div>

            {/* Financial Year Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                Select Year:
              </span>
              {availableFinancialYears.map(fy => (
                <button
                  key={fy}
                  onClick={() => {
                    setSelectedFy(fy);
                    setSelectedMonthIndex(null);
                  }}
                  className={`px-4 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                    selectedFy === fy
                      ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/90'
                  }`}
                >
                  FY {fy}
                </button>
              ))}
            </div>
          </div>

          {/* FY Executive Summary KPI Cards (4 Columns) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md border border-slate-800">
              <span className="text-[10px] sm:text-xs text-slate-400 font-extrabold uppercase tracking-wider block">
                FY {selectedFy} Total Bills
              </span>
              <p className="text-2xl sm:text-3xl font-black font-mono mt-1 text-white">
                {fyTotalCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Completed & Exported to Tally</p>
            </div>

            <div className="bg-emerald-900/95 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md border border-emerald-700">
              <span className="text-[10px] sm:text-xs text-emerald-300 font-extrabold uppercase tracking-wider block">
                FY {selectedFy} Total Value
              </span>
              <p className="text-2xl sm:text-3xl font-black font-mono mt-1 text-emerald-300">
                ₹{(fyTotalAmount / 100000).toFixed(2)}L
              </p>
              <p className="text-[11px] text-emerald-200 mt-0.5">₹{fyTotalAmount.toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-sky-900/95 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md border border-sky-700">
              <span className="text-[10px] sm:text-xs text-sky-300 font-extrabold uppercase tracking-wider block">
                Monthly Average
              </span>
              <p className="text-2xl sm:text-3xl font-black font-mono mt-1 text-sky-300">
                {avgPerMonthCount} Bills/Mo
              </p>
              <p className="text-[11px] text-sky-200 mt-0.5">
                ₹{(fyTotalAmount / 12 / 100000).toFixed(2)}L Avg Value / Month
              </p>
            </div>

            <div className="bg-indigo-900/95 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md border border-indigo-700">
              <span className="text-[10px] sm:text-xs text-indigo-300 font-extrabold uppercase tracking-wider block">
                Peak Month
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono mt-1 text-indigo-200 truncate">
                {peakMonth ? peakMonth.monthName : '—'}
              </p>
              <p className="text-[11px] text-indigo-300 mt-0.5 font-mono">
                {peakMonth?.count || 0} Bills • ₹{((peakMonth?.totalAmount || 0) / 100000).toFixed(2)}L
              </p>
            </div>
          </div>

          {/* 12-Month Grid (April to March) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-600" />
                  Month-wise Completed Summary (April to March)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any month tile to view the complete bill details list below
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">12 Months Sequence</span>
            </div>

            {/* 12 Months Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {fyMonthlySummary.map((m, idx) => {
                const isSelected = activeMonthData?.monthIndex === m.monthIndex;
                const hasBills = m.count > 0;

                return (
                  <div
                    key={m.fullLabel}
                    onClick={() => setSelectedMonthIndex(m.monthIndex)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-sky-50 to-white border-sky-500 ring-2 ring-sky-500/20 shadow-md transform -translate-y-0.5'
                        : hasBills
                        ? 'bg-slate-50/70 border-slate-200/90 hover:bg-slate-100/80 hover:border-slate-300'
                        : 'bg-white border-slate-100 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                          {m.monthName}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {m.year}
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <span className="text-lg sm:text-xl font-black font-mono text-slate-900 block leading-tight">
                          {m.count} <span className="text-xs font-medium text-slate-400">bills</span>
                        </span>
                        <span className="text-xs font-black font-mono text-emerald-700 block mt-0.5">
                          ₹{(m.totalAmount / 100000).toFixed(2)}L
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-bold">
                        {hasBills ? `₹${m.totalAmount.toLocaleString('en-IN')}` : 'No bills'}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Monthly Drilldown Table */}
          {activeMonthData && (
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">
                        Completed Bills: <span className="text-sky-700">{activeMonthData.fullLabel}</span>
                      </h3>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-full text-xs">
                        {activeMonthData.count} Bills
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Total Completed Value: <strong className="text-emerald-700 font-mono">₹{activeMonthData.totalAmount.toLocaleString('en-IN')}</strong> (₹{(activeMonthData.totalAmount / 100000).toFixed(2)}L)
                    </p>
                  </div>
                </div>

                {/* Search & Export Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={historySearch}
                      onChange={e => setHistorySearch(e.target.value)}
                      placeholder="Filter BR, bill no, party..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    onClick={handleExportMonthCsv}
                    disabled={activeMonthData.bills.length === 0}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer min-h-[34px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Drilldown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[1000px]">
                  <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5 whitespace-nowrap">Header ID</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">BR No</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">BR Date</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">Bill No</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">Bill Date</th>
                      <th className="py-3 px-4 whitespace-nowrap">Supplier Party</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">Amount</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">Category</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">Current Holder</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">Tally Exported Date</th>
                      <th className="py-3 px-3.5 text-right whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredMonthBills.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-slate-400">
                          <CheckCircle2 className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                          No bills completed/exported in {activeMonthData.fullLabel}.
                        </td>
                      </tr>
                    ) : (
                      filteredMonthBills.map(b => (
                        <tr
                          key={b.header_id}
                          onClick={() => onSelectBill(b)}
                          className="hover:bg-slate-50 transition cursor-pointer"
                        >
                          <td className="py-3 px-3.5 font-mono font-bold text-slate-500 whitespace-nowrap">
                            #{b.header_id}
                          </td>
                          <td className="py-3 px-3.5 font-extrabold text-sky-700 font-mono whitespace-nowrap">
                            {b.br_no}
                          </td>
                          <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                            {formatDateOnly(b.br_date)}
                          </td>
                          <td className="py-3 px-3.5 font-mono font-semibold text-slate-800 whitespace-nowrap">
                            {b.bill_no}
                          </td>
                          <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                            {formatDateOnly(b.bill_date)}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                            {b.supplier}
                          </td>
                          <td className="py-3 px-3.5 font-black text-slate-900 font-mono whitespace-nowrap">
                            ₹{b.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                              {b.category}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 font-semibold text-slate-700 whitespace-nowrap">
                            {b.current_holder_name || '—'}
                          </td>
                          <td className="py-3 px-3.5 font-mono font-bold text-emerald-800 whitespace-nowrap">
                            {formatDateOnly(b.tally_exported_date)}
                          </td>
                          <td className="py-3 px-3.5 text-right whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap bg-emerald-100 text-emerald-800 border border-emerald-200">
                              EXPORTED
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
