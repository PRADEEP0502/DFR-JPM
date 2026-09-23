import React, { useState, useMemo } from 'react';
import {
  FolderCheck,
  FolderClock,
  Archive,
  IndianRupee,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  Layers,
  ArrowRight,
  UserCheck,
  FileText,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { BillRegisterItem, DfrUser, isTallyExported } from '../../types/dfr';
import { dfrService } from '../../services/dfrService';
import { isFilingAuthorized } from '../../services/authService';
import { Card3D } from '../ui/Card3D';

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

const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const hoursStr = String(hours).padStart(2, '0');

  return `${day}/${month}/${year}, ${hoursStr}:${minutes} ${ampm}`;
};

interface FilingViewProps {
  bills: BillRegisterItem[];
  currentUser: DfrUser;
  onSelectBill: (bill: BillRegisterItem) => void;
  onRefresh: () => void;
}

export const FilingView: React.FC<FilingViewProps> = ({
  bills,
  currentUser,
  onSelectBill,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'filed'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedFiledBy, setSelectedFiledBy] = useState<string>('ALL');
  const [filingBillConfirm, setFilingBillConfirm] = useState<BillRegisterItem | null>(null);
  const [filingNote, setFilingNote] = useState<string>('');

  const canMarkFiling = isFilingAuthorized(currentUser);

  // Filter 1: Pending Filing bills (Strict Rule: Must be Tally Exported & not yet Filed)
  const pendingFilingBills = useMemo(() => {
    return bills.filter(
      b => isTallyExported(b) && b.filing_status !== 'FILED'
    );
  }, [bills]);

  // Filter 2: Manually Filed Bills
  const filedBills = useMemo(() => {
    return bills.filter(b => b.filing_status === 'FILED');
  }, [bills]);

  // Overall KPI Metrics
  const pendingFilingCount = pendingFilingBills.length;
  const pendingFilingAmount = useMemo(
    () => pendingFilingBills.reduce((sum, b) => sum + b.amount, 0),
    [pendingFilingBills]
  );

  const filedCount = filedBills.length;
  const filedAmount = useMemo(
    () => filedBills.reduce((sum, b) => sum + b.amount, 0),
    [filedBills]
  );

  // Available categories for dropdown
  const categories = useMemo(() => {
    const list = new Set<string>();
    bills.forEach(b => {
      if (b.category && b.category.trim()) {
        list.add(b.category.trim().toUpperCase());
      }
    });
    return Array.from(list).sort();
  }, [bills]);

  // Available filed by users for dropdown
  const filedByUsers = useMemo(() => {
    const list = new Set<string>();
    filedBills.forEach(b => {
      const name = b.filed_by_name || b.filed_by;
      if (name && name.trim()) {
        list.add(name.trim());
      }
    });
    return Array.from(list).sort();
  }, [filedBills]);

  // Current filtered dataset based on active tab & filters
  const displayedBills = useMemo(() => {
    const sourceList = activeTab === 'pending' ? pendingFilingBills : filedBills;

    return sourceList.filter(b => {
      // Search query (BR No, Bill No, Supplier, Header ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchBr = (b.br_no || '').toLowerCase().includes(q);
        const matchBillNo = (b.bill_no || '').toLowerCase().includes(q);
        const matchSupplier = (b.supplier || '').toLowerCase().includes(q);
        const matchHeader = String(b.header_id).includes(q);
        if (!matchBr && !matchBillNo && !matchSupplier && !matchHeader) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'ALL') {
        if ((b.category || '').toUpperCase() !== selectedCategory.toUpperCase()) {
          return false;
        }
      }

      // Filed By filter (only on filed tab)
      if (activeTab === 'filed' && selectedFiledBy !== 'ALL') {
        const name = b.filed_by_name || b.filed_by || '';
        if (name.trim().toLowerCase() !== selectedFiledBy.trim().toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [
    activeTab,
    pendingFilingBills,
    filedBills,
    searchQuery,
    selectedCategory,
    selectedFiledBy,
  ]);

  const handleConfirmFiling = () => {
    if (!filingBillConfirm) return;
    dfrService.markBillAsFiled(filingBillConfirm.header_id, currentUser.id, filingNote);
    setFilingBillConfirm(null);
    setFilingNote('');
    onRefresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <FolderCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Physical Document Filing
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium pl-1">
            Manual physical filing management for bills exported to Tally software.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl shadow-2xs shrink-0 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">
            Filing Workflow Active
          </span>
        </div>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* KPI 1: Pending Filing */}
        <Card3D
          onClick={() => setActiveTab('pending')}
          className="p-5 sm:p-6 bg-gradient-to-br from-white to-amber-50/40 hover:to-amber-50/70 border-slate-200/90 hover:border-amber-300 shadow-2xs transition"
          glowColor="rgba(245, 158, 11, 0.15)"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <FolderClock className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
              Action Required
            </span>
          </div>
          <div className="mt-4 space-y-0.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Pending Filing
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {pendingFilingCount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-amber-700 font-bold">
              ₹ {pendingFilingAmount.toLocaleString('en-IN')} awaiting archive
            </p>
          </div>
        </Card3D>

        {/* KPI 2: Filed Records */}
        <Card3D
          onClick={() => setActiveTab('filed')}
          className="p-5 sm:p-6 bg-gradient-to-br from-white to-emerald-50/40 hover:to-emerald-50/70 border-slate-200/90 hover:border-emerald-300 shadow-2xs transition"
          glowColor="rgba(16, 185, 129, 0.15)"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <FolderCheck className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
              Completed
            </span>
          </div>
          <div className="mt-4 space-y-0.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Filed History
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {filedCount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-emerald-700 font-bold">
              Physically archived in storage
            </p>
          </div>
        </Card3D>

        {/* KPI 3: Total Filed Amount */}
        <Card3D
          onClick={() => setActiveTab('filed')}
          className="p-5 sm:p-6 bg-gradient-to-br from-white to-sky-50/40 hover:to-sky-50/70 border-slate-200/90 hover:border-sky-300 shadow-2xs transition sm:col-span-2 lg:col-span-1"
          glowColor="rgba(2, 132, 199, 0.15)"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-xs">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-200">
              Financial Value
            </span>
          </div>
          <div className="mt-4 space-y-0.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Filed Amount
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ₹ {filedAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-sky-700 font-bold">
              {filedCount} bills successfully stored
            </p>
          </div>
        </Card3D>
      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        
        {/* Navigation Tabs Bar */}
        <div className="border-b border-slate-200/90 px-4 sm:px-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            {/* Tab 1: Pending Filing */}
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition cursor-pointer border ${
                activeTab === 'pending'
                  ? 'bg-white text-slate-900 border-slate-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
              }`}
            >
              <FolderClock className="w-4 h-4 text-amber-600" />
              <span>Pending Filing</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  activeTab === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {pendingFilingCount}
              </span>
            </button>

            {/* Tab 2: Filed History */}
            <button
              onClick={() => setActiveTab('filed')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition cursor-pointer border ${
                activeTab === 'filed'
                  ? 'bg-white text-slate-900 border-slate-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
              }`}
            >
              <FolderCheck className="w-4 h-4 text-emerald-600" />
              <span>Filed History</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  activeTab === 'filed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {filedCount}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium pb-2 sm:pb-0">
            Showing <strong>{displayedBills.length}</strong> record{displayedBills.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by BR No, Bill No, Supplier, Header ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition min-h-[38px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold p-1 cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-bold hidden sm:inline">Category:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Filed By Filter (Only in Filed History) */}
            {activeTab === 'filed' && filedByUsers.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-bold hidden sm:inline">Filed By:</span>
                <select
                  value={selectedFiledBy}
                  onChange={e => setSelectedFiledBy(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">All Users</option>
                  {filedByUsers.map(u => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reset Filters */}
            {(searchQuery || selectedCategory !== 'ALL' || selectedFiledBy !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setSelectedFiledBy('ALL');
                }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: PENDING FILING TABLE & CARDS */}
        {activeTab === 'pending' && (
          <div>
            {displayedBills.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  No Bills Pending Physical Filing
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  All Tally-exported bills have been physically filed in archives. New exported bills will appear here automatically.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop & Tablet Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500 select-none">
                      <tr>
                        <th className="py-3.5 px-4"># ID</th>
                        <th className="py-3.5 px-4">BR No</th>
                        <th className="py-3.5 px-4">BR Date</th>
                        <th className="py-3.5 px-4">Bill No</th>
                        <th className="py-3.5 px-4">Bill Date</th>
                        <th className="py-3.5 px-4">Supplier</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4 text-right">Amount</th>
                        <th className="py-3.5 px-4">Tally Exported</th>
                        <th className="py-3.5 px-4">Filing Status</th>
                        <th className="py-3.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {displayedBills.map(bill => (
                        <tr
                          key={bill.header_id}
                          onClick={() => onSelectBill(bill)}
                          className="hover:bg-slate-50/90 transition cursor-pointer group"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                            #{bill.header_id}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-sky-700 group-hover:underline">
                            {bill.br_no}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {formatDateOnly(bill.br_date)}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            {bill.bill_no}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {formatDateOnly(bill.bill_date)}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-900 max-w-[200px] truncate">
                            {bill.supplier}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                              {bill.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900 text-right">
                            ₹ {bill.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {formatDateOnly(bill.tally_exported_date)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Pending Filing
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                            {canMarkFiling ? (
                              <button
                                onClick={() => setFilingBillConfirm(bill)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5 mx-auto"
                              >
                                <FolderCheck className="w-3.5 h-3.5" />
                                <span>Mark as Filed</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">View Only</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden divide-y divide-slate-100">
                  {displayedBills.map(bill => (
                    <div
                      key={bill.header_id}
                      onClick={() => onSelectBill(bill)}
                      className="p-4 space-y-3 hover:bg-slate-50/80 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-sky-700 text-sm">
                          {bill.br_no}
                        </span>
                        <span className="font-mono text-slate-400 text-xs">
                          #{bill.header_id}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-900 text-sm">
                          {bill.supplier}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Bill: <strong className="font-mono text-slate-800">{bill.bill_no}</strong></span>
                          <span>•</span>
                          <span>{formatDateOnly(bill.bill_date)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Amount</span>
                          <span className="font-black text-slate-900 text-sm">
                            ₹ {bill.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                          {bill.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                        <div className="text-[11px] text-slate-500">
                          Exported: <strong className="font-mono">{formatDateOnly(bill.tally_exported_date)}</strong>
                        </div>
                        {canMarkFiling && (
                          <button
                            onClick={() => setFilingBillConfirm(bill)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <FolderCheck className="w-3.5 h-3.5" />
                            <span>Mark as Filed</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: FILED HISTORY TABLE & CARDS */}
        {activeTab === 'filed' && (
          <div>
            {displayedBills.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200 shadow-2xs">
                  <Archive className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  No Filed Records Match Current Filters
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Bills marked as physically filed in archives will permanently appear in this section.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop & Tablet Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500 select-none">
                      <tr>
                        <th className="py-3.5 px-4"># ID</th>
                        <th className="py-3.5 px-4">BR No</th>
                        <th className="py-3.5 px-4">BR Date</th>
                        <th className="py-3.5 px-4">Bill No</th>
                        <th className="py-3.5 px-4">Supplier</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4 text-right">Amount</th>
                        <th className="py-3.5 px-4">Tally Exported</th>
                        <th className="py-3.5 px-4">Filing Date</th>
                        <th className="py-3.5 px-4">Filed By</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {displayedBills.map(bill => (
                        <tr
                          key={bill.header_id}
                          onClick={() => onSelectBill(bill)}
                          className="hover:bg-slate-50/90 transition cursor-pointer group"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                            #{bill.header_id}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-sky-700 group-hover:underline">
                            {bill.br_no}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {formatDateOnly(bill.br_date)}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            {bill.bill_no}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-900 max-w-[200px] truncate">
                            {bill.supplier}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                              {bill.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900 text-right">
                            ₹ {bill.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {formatDateOnly(bill.tally_exported_date)}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            {formatDateTime(bill.filing_date)}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-900">
                            {bill.filed_by_name || bill.filed_by || 'ACCOUNTS'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-1 mx-auto w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              FILED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden divide-y divide-slate-100">
                  {displayedBills.map(bill => (
                    <div
                      key={bill.header_id}
                      onClick={() => onSelectBill(bill)}
                      className="p-4 space-y-3 hover:bg-slate-50/80 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-sky-700 text-sm">
                          {bill.br_no}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          FILED
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-900 text-sm">
                          {bill.supplier}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Bill: <strong className="font-mono text-slate-800">{bill.bill_no}</strong></span>
                          <span>•</span>
                          <span>{formatDateOnly(bill.bill_date)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Amount</span>
                          <span className="font-black text-slate-900 text-sm">
                            ₹ {bill.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                          {bill.category}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Filing Date:</span>
                          <span className="font-mono font-bold text-slate-800">{formatDateTime(bill.filing_date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Filed By:</span>
                          <span className="font-extrabold text-slate-800">{bill.filed_by_name || bill.filed_by || 'ACCOUNTS'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Mark as Filed */}
      {filingBillConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <FolderCheck className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                Confirm Physical Filing
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Have you physically filed this bill in the document archives?
              </p>

              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">BR No:</span>
                  <span className="font-mono font-black text-slate-900">{filingBillConfirm.br_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Bill No:</span>
                  <span className="font-mono font-bold text-slate-900">{filingBillConfirm.bill_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Supplier:</span>
                  <span className="font-extrabold text-slate-900 truncate max-w-[200px]">{filingBillConfirm.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Amount:</span>
                  <span className="font-black text-emerald-700">₹ {filingBillConfirm.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Tally Exported:</span>
                  <span className="font-mono text-slate-700">{formatDateOnly(filingBillConfirm.tally_exported_date)}</span>
                </div>
              </div>

              <div className="pt-2 text-left">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Optional Filing Reference / Notes:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Box #12, Rack A-4, File 2026-Q3..."
                  value={filingNote}
                  onChange={e => setFilingNote(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setFilingBillConfirm(null);
                  setFilingNote('');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFiling}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FolderCheck className="w-4 h-4" />
                <span>Confirm Filing</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
