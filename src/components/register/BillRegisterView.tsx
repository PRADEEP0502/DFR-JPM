import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Filter,
  ArrowUpDown,
  Calendar,
  X,
  RotateCcw,
  Check,
  User,
  Layers,
  Sparkles,
  IndianRupee,
  Clock,
  AlertOctagon,
  ChevronRight,
} from 'lucide-react';
import {
  BillRegisterItem,
  DfrUser,
  DfrLabel,
  AgeBand,
  ProcessStage,
  STAGE_DISPLAY_NAMES,
} from '../../types/dfr';

interface BillRegisterViewProps {
  bills: BillRegisterItem[];
  users: DfrUser[];
  labels: DfrLabel[];
  searchQuery: string;
  onSelectBill: (bill: BillRegisterItem) => void;
}

type DateFilterPreset =
  | 'ALL'
  | 'TODAY'
  | 'YESTERDAY'
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'CUSTOM';

export const BillRegisterView: React.FC<BillRegisterViewProps> = ({
  bills,
  users,
  labels,
  searchQuery,
  onSelectBill,
}) => {
  // Filter States
  const [holderFilter, setHolderFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [bandFilter, setBandFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedLabelId, setSelectedLabelId] = useState<string>('ALL');

  // Date Filter States (Based strictly on BR Date / Inward Date)
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('ALL');
  const [customFromDate, setCustomFromDate] = useState<string>('');
  const [customToDate, setCustomToDate] = useState<string>('');
  const [appliedCustomFrom, setAppliedCustomFrom] = useState<string>('');
  const [appliedCustomTo, setAppliedCustomTo] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<keyof BillRegisterItem>('header_id');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Unique Categories extracted from actual dataset
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    bills.forEach(b => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set).sort();
  }, [bills]);

  // Date range calculator for BR Date (Dynamic Real-Time)
  const isWithinDateFilter = (brDateStr: string): boolean => {
    if (datePreset === 'ALL') return true;

    const brDate = new Date(brDateStr);
    const now = new Date();

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const todayStr = formatDate(now);

    if (datePreset === 'TODAY') {
      return brDateStr === todayStr;
    }

    if (datePreset === 'YESTERDAY') {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return brDateStr === formatDate(yesterday);
    }

    if (datePreset === 'LAST_7_DAYS') {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const cutoffStr = formatDate(cutoff);
      return brDateStr >= cutoffStr && brDateStr <= todayStr;
    }

    if (datePreset === 'LAST_30_DAYS') {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const cutoffStr = formatDate(cutoff);
      return brDateStr >= cutoffStr && brDateStr <= todayStr;
    }

    if (datePreset === 'THIS_MONTH') {
      return (
        brDate.getFullYear() === now.getFullYear() &&
        brDate.getMonth() === now.getMonth()
      );
    }

    if (datePreset === 'LAST_MONTH') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        brDate.getFullYear() === lastMonth.getFullYear() &&
        brDate.getMonth() === lastMonth.getMonth()
      );
    }

    if (datePreset === 'CUSTOM') {
      if (appliedCustomFrom && brDateStr < appliedCustomFrom) return false;
      if (appliedCustomTo && brDateStr > appliedCustomTo) return false;
      return true;
    }

    return true;
  };

  const handleApplyCustomDate = () => {
    setAppliedCustomFrom(customFromDate);
    setAppliedCustomTo(customToDate);
  };

  const clearFilters = () => {
    setHolderFilter('ALL');
    setStageFilter('ALL');
    setBandFilter('ALL');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setSelectedLabelId('ALL');
    setDatePreset('ALL');
    setCustomFromDate('');
    setCustomToDate('');
    setAppliedCustomFrom('');
    setAppliedCustomTo('');
  };

  const hasActiveFilters =
    holderFilter !== 'ALL' ||
    stageFilter !== 'ALL' ||
    bandFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    selectedLabelId !== 'ALL' ||
    datePreset !== 'ALL';

  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      // Date Filter (BR Date)
      if (!isWithinDateFilter(b.br_date)) return false;

      // Dropdown Filters
      if (holderFilter !== 'ALL' && b.current_holder_id !== holderFilter) return false;
      if (stageFilter !== 'ALL') {
        if (stageFilter === 'ACCOUNTS') {
          if (b.current_stage !== 'ACCOUNTS' && b.current_stage !== 'TALLY') return false;
        } else if (b.current_stage !== stageFilter) {
          return false;
        }
      }
      if (bandFilter !== 'ALL' && b.age_band !== bandFilter) return false;
      if (statusFilter !== 'ALL' && b.bill_status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && b.category !== categoryFilter) return false;
      if (selectedLabelId !== 'ALL') {
        const hasLabel = b.labels.some(l => l.id === selectedLabelId);
        if (!hasLabel) return false;
      }

      // Search Query: Header ID, BR No, Bill No, Party / Supplier
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchHeader = b.header_id.toString().includes(q);
        const matchBr = b.br_no.toLowerCase().includes(q);
        const matchBillNo = b.bill_no.toLowerCase().includes(q);
        const matchSupplier = b.supplier.toLowerCase().includes(q);
        const matchCategory = b.category.toLowerCase().includes(q);
        const matchTag = b.labels.some(l => l.name.toLowerCase().includes(q));

        if (!matchHeader && !matchBr && !matchBillNo && !matchSupplier && !matchCategory && !matchTag) {
          return false;
        }
      }

      return true;
    });
  }, [
    bills,
    holderFilter,
    stageFilter,
    bandFilter,
    statusFilter,
    categoryFilter,
    selectedLabelId,
    datePreset,
    appliedCustomFrom,
    appliedCustomTo,
    searchQuery,
  ]);

  const sortedBills = useMemo(() => {
    return [...filteredBills].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = (valA as string).toLowerCase();
      if (typeof valB === 'string') valB = (valB as string).toLowerCase();

      if (valA! < valB!) return sortAsc ? -1 : 1;
      if (valA! > valB!) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredBills, sortField, sortAsc]);

  const handleSort = (field: keyof BillRegisterItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Summary Metrics for filtered view
  const totalFilteredAmount = useMemo(() => {
    return filteredBills.reduce((sum, b) => sum + b.amount, 0);
  }, [filteredBills]);

  const criticalFilteredCount = useMemo(() => {
    return filteredBills.filter(b => b.age_band === 'A-10').length;
  }, [filteredBills]);

  const avgAgeDays = useMemo(() => {
    if (filteredBills.length === 0) return 0;
    const total = filteredBills.reduce((sum, b) => sum + b.age_days, 0);
    return Math.round(total / filteredBills.length);
  }, [filteredBills]);

  const ageBandColors: Record<AgeBand, string> = {
    NORMAL: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold',
    'A-3': 'bg-yellow-50 text-yellow-800 border-yellow-300 font-bold',
    'A-5': 'bg-amber-50 text-amber-800 border-amber-300 font-extrabold',
    'A-10': 'bg-red-50 text-red-700 border-red-300 font-black animate-pulse',
  };

  const stageBadgeColors: Record<ProcessStage, string> = {
    BILL_INWARD: 'bg-slate-100 text-slate-700 border-slate-300',
    IAD: 'bg-sky-50 text-sky-700 border-sky-200',
    AO: 'bg-blue-50 text-blue-700 border-blue-200',
    JMD: 'bg-purple-50 text-purple-700 border-purple-200',
    ACCOUNTS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    TALLY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Top Header Title & Metrics Strip */}
      <div className="bg-slate-900 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate">Master Bill Register</h1>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Real-time Selsoft ERP pipeline tracking from Bill Inward to Tally
              </p>
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics Badges (4 Columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-2xs">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">
              Filtered Bills
            </span>
            <p className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">{sortedBills.length}</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-2xs">
            <span className="text-[10px] text-emerald-400 uppercase font-extrabold tracking-wider block">
              Total Value
            </span>
            <p className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-0.5">
              ₹{(totalFilteredAmount / 100000).toFixed(2)}L
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-2xs">
            <span className="text-[10px] text-amber-400 uppercase font-extrabold tracking-wider block">
              Avg Age
            </span>
            <p className="text-lg sm:text-xl font-black text-amber-300 font-mono mt-0.5">{avgAgeDays} Days</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-2xs">
            <span className="text-[10px] text-rose-400 uppercase font-extrabold tracking-wider block">
              A-10 Critical
            </span>
            <p className="text-lg sm:text-xl font-black text-rose-400 font-mono mt-0.5">{criticalFilteredCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Controls Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 shadow-xs space-y-4">
        {/* Date Filter Toolbar (Based on BR Date) */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>BR Date / Inward Filter:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {(
                [
                  { id: 'ALL', label: 'All Dates' },
                  { id: 'TODAY', label: 'Today' },
                  { id: 'YESTERDAY', label: 'Yesterday' },
                  { id: 'LAST_7_DAYS', label: 'Last 7 Days' },
                  { id: 'LAST_30_DAYS', label: 'Last 30 Days' },
                  { id: 'THIS_MONTH', label: 'This Month' },
                  { id: 'LAST_MONTH', label: 'Last Month' },
                  { id: 'CUSTOM', label: 'Custom Range' },
                ] as const
              ).map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setDatePreset(preset.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                    datePreset === preset.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/90 hover:text-slate-900'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          {datePreset === 'CUSTOM' && (
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-2xl">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-600">From:</span>
                <input
                  type="date"
                  value={customFromDate}
                  onChange={e => setCustomFromDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-600">To:</span>
                <input
                  type="date"
                  value={customToDate}
                  onChange={e => setCustomToDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <button
                onClick={handleApplyCustomDate}
                className="px-3.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Apply
              </button>
            </div>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-sky-600" />
            <span>Field Filters</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-extrabold flex items-center gap-1 cursor-pointer bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 text-xs">
          {/* Category */}
          <div>
            <label className="block text-[11px] text-slate-500 font-bold mb-1">Category (ERP)</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50/90 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 font-semibold"
            >
              <option value="ALL">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Current Holder */}
          <div>
            <label className="block text-[11px] text-slate-500 font-bold mb-1">Current Holder</label>
            <select
              value={holderFilter}
              onChange={e => setHolderFilter(e.target.value)}
              className="w-full bg-slate-50/90 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 font-semibold"
            >
              <option value="ALL">All Holders</option>
              {users
                .filter(u => u.id !== 'user-000' && u.id !== 'user-006' && u.id !== 'user-008' && u.id !== 'user-009' && u.id !== 'user-010')
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.full_name}
                  </option>
                ))}
            </select>
          </div>

          {/* Current Stage */}
          <div>
            <label className="block text-[11px] text-slate-500 font-bold mb-1">Current Stage</label>
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="w-full bg-slate-50/90 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 font-semibold"
            >
              <option value="ALL">All Stages</option>
              {(
                [
                  'BILL_INWARD',
                  'IAD',
                  'AO',
                  'JMD',
                  'ACCOUNTS',
                ] as ProcessStage[]
              ).map(st => (
                <option key={st} value={st}>
                  {STAGE_DISPLAY_NAMES[st]}
                </option>
              ))}
            </select>
          </div>

          {/* Ageing Band */}
          <div>
            <label className="block text-[11px] text-slate-500 font-bold mb-1">Ageing Band</label>
            <select
              value={bandFilter}
              onChange={e => setBandFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="ALL">All Bands</option>
              <option value="NORMAL">Normal (0-2d)</option>
              <option value="A-3">A-3 (3-4d)</option>
              <option value="A-5">A-5 (5-9d)</option>
              <option value="A-10">A-10 (≥10d)</option>
            </select>
          </div>

          {/* Bill Status */}
          <div>
            <label className="block text-[11px] text-slate-500 font-bold mb-1">Status (ERP)</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Deleted">Deleted</option>
              <option value="OPEN">OPEN</option>
              <option value="PAID">PAID</option>
            </select>
          </div>

          {/* Multi-Label Tag */}
          <div>
            <label className="block text-[11px] text-slate-500 font-bold mb-1">Custom Labels</label>
            <select
              value={selectedLabelId}
              onChange={e => setSelectedLabelId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="ALL">All Labels</option>
              {labels.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table: Spacious, Clean 14-Column Grid with Scroll */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1440px] border-collapse">
            <thead className="bg-slate-100/95 text-slate-600 uppercase tracking-wider font-extrabold text-[11px] border-b border-slate-200 sticky top-0 z-10 backdrop-blur">
              <tr>
                {/* 1. Header ID */}
                <th
                  onClick={() => handleSort('header_id')}
                  className="py-4 px-4 w-24 min-w-[90px] cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Header ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 2. BR No */}
                <th
                  onClick={() => handleSort('br_no')}
                  className="py-4 px-4 w-28 min-w-[110px] cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>BR No</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 3. BR Date */}
                <th
                  onClick={() => handleSort('br_date')}
                  className="py-4 px-4 w-28 min-w-[110px] cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>BR Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 4. Bill No */}
                <th className="py-4 px-4 w-28 min-w-[110px]">Bill No</th>

                {/* 5. Bill Date */}
                <th className="py-4 px-4 w-28 min-w-[110px]">Bill Date</th>

                {/* 6. Party / Supplier */}
                <th
                  onClick={() => handleSort('supplier')}
                  className="py-4 px-4 min-w-[200px] cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Party / Supplier</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 7. Amount */}
                <th
                  onClick={() => handleSort('amount')}
                  className="py-4 px-4 w-32 min-w-[120px] cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 8. Category */}
                <th className="py-4 px-4 w-28 min-w-[110px]">Category</th>

                {/* 9. Current Holder */}
                <th className="py-4 px-4 w-36 min-w-[140px]">Current Holder</th>

                {/* 10. Current Stage */}
                <th className="py-4 px-4 w-32 min-w-[120px]">Current Stage</th>

                {/* 11. Age */}
                <th
                  onClick={() => handleSort('age_days')}
                  className="py-4 px-4 w-20 min-w-[80px] cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Age</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 12. Ageing */}
                <th className="py-4 px-4 w-24 min-w-[90px]">Ageing</th>

                {/* 13. Status */}
                <th className="py-4 px-4 w-28 min-w-[110px]">Status</th>

                {/* 14. Labels */}
                <th className="py-4 px-4 w-36 min-w-[130px]">Labels</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800 bg-white">
              {sortedBills.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-16 text-center text-slate-500">
                    <p className="text-sm font-semibold">No bill records match your current search and filter selection.</p>
                    <button
                      onClick={clearFilters}
                      className="mt-3 px-4 py-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-xl text-xs font-bold transition"
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              ) : (
                sortedBills.map((b, idx) => (
                  <tr
                    key={b.header_id}
                    onClick={() => onSelectBill(b)}
                    className={`hover:bg-sky-50/70 transition cursor-pointer group ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }`}
                  >
                    {/* 1. Header ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 whitespace-nowrap">
                      #{b.header_id}
                    </td>

                    {/* 2. BR No */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-extrabold text-sky-700 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-lg group-hover:bg-sky-100 transition">
                        {b.br_no}
                      </span>
                    </td>

                    {/* 3. BR Date */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                      {b.br_date}
                    </td>

                    {/* 4. Bill No */}
                    <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px] whitespace-nowrap font-bold">
                      {b.bill_no}
                    </td>

                    {/* 5. Bill Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {b.bill_date}
                    </td>

                    {/* 6. Party / Supplier */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {b.supplier}
                    </td>

                    {/* 7. Amount */}
                    <td className="py-3.5 px-4 font-black text-slate-900 whitespace-nowrap">
                      ₹{b.amount.toLocaleString('en-IN')}
                    </td>

                    {/* 8. Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200 shadow-2xs">
                        {b.category}
                      </span>
                    </td>

                    {/* 9. Current Holder */}
                    <td className="py-3.5 px-4 font-extrabold text-sky-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-black border border-sky-200">
                          {b.current_holder_name.charAt(0)}
                        </div>
                        <span>{b.current_holder_name}</span>
                      </div>
                    </td>

                    {/* 10. Current Stage */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-semibold">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] border font-bold ${
                          stageBadgeColors[b.current_stage] || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {STAGE_DISPLAY_NAMES[b.current_stage] || b.current_stage}
                      </span>
                    </td>

                    {/* 11. Age */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-700">
                      {b.age_days}d
                    </td>

                    {/* 12. Ageing (A-3 / A-5 / A-10 inside Ageing) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] border shadow-2xs ${
                          ageBandColors[b.age_band]
                        }`}
                      >
                        {b.age_band}
                      </span>
                    </td>

                    {/* 13. Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {b.bill_status === 'PAID' ? (
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg">
                          PAID
                        </span>
                      ) : b.approval_status === 'REJECTED' ? (
                        <span className="text-[10px] font-extrabold text-red-700 bg-red-100 border border-red-300 px-2.5 py-1 rounded-lg">
                          REJECTED
                        </span>
                      ) : b.tally_status === 'EXPORTED' || b.tally_status === 'POSTED' ? (
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg">
                          Tally Exported
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-semibold">
                          {b.bill_status}
                        </span>
                      )}
                    </td>

                    {/* 14. Labels */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {b.labels.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">—</span>
                        ) : (
                          b.labels.map(l => (
                            <span
                              key={l.id}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-2xs"
                              style={{ backgroundColor: l.color }}
                            >
                              {l.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
