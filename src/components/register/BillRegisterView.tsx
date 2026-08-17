import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Filter,
  ArrowUpDown,
  Tag,
  Search,
  CheckCircle2,
  Clock,
  User,
  Calculator,
  CreditCard,
  X
} from 'lucide-react';
import { BillRegisterItem, DfrUser, DfrLabel, AgeBand, DfrStatus, BillCategory, ProcessStage } from '../../types/dfr';

interface BillRegisterViewProps {
  bills: BillRegisterItem[];
  users: DfrUser[];
  labels: DfrLabel[];
  searchQuery: string;
  onSelectBill: (bill: BillRegisterItem) => void;
}

export const BillRegisterView: React.FC<BillRegisterViewProps> = ({
  bills,
  users,
  labels,
  searchQuery,
  onSelectBill,
}) => {
  const [holderFilter, setHolderFilter] = useState<string>('ALL');
  const [ownerFilter, setOwnerFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [bandFilter, setBandFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedLabelId, setSelectedLabelId] = useState<string>('ALL');

  const [sortField, setSortField] = useState<keyof BillRegisterItem>('gb_no');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      if (holderFilter !== 'ALL' && b.current_holder_id !== holderFilter) return false;
      if (ownerFilter !== 'ALL' && b.owner_id !== ownerFilter) return false;
      if (stageFilter !== 'ALL' && b.current_stage !== stageFilter) return false;
      if (bandFilter !== 'ALL' && b.age_band !== bandFilter) return false;
      if (statusFilter !== 'ALL' && b.dfr_status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && b.category !== categoryFilter) return false;
      if (selectedLabelId !== 'ALL') {
        const hasLabel = b.labels.some(l => l.id === selectedLabelId);
        if (!hasLabel) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchGb = b.gb_no.toString().includes(q);
        const matchDc = b.bill_dc_no.toLowerCase().includes(q);
        const matchParty = b.party_name.toLowerCase().includes(q);
        const matchTag = b.labels.some(l => l.name.toLowerCase().includes(q));
        if (!matchGb && !matchDc && !matchParty && !matchTag) return false;
      }

      return true;
    });
  }, [
    bills,
    holderFilter,
    ownerFilter,
    stageFilter,
    bandFilter,
    statusFilter,
    categoryFilter,
    selectedLabelId,
    searchQuery
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

  const ageBandColors = {
    NORMAL: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'A-3': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'A-5': 'bg-amber-100 text-amber-800 border-amber-200',
    'A-10': 'bg-red-100 text-red-800 border-red-200 font-extrabold animate-pulse',
  };

  const clearFilters = () => {
    setHolderFilter('ALL');
    setOwnerFilter('ALL');
    setStageFilter('ALL');
    setBandFilter('ALL');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setSelectedLabelId('ALL');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-sky-600" />
            Master Bill Register
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete database view with multi-label filtering, age bands, and physical stage tracking
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs font-semibold">
          Showing <strong className="text-sky-600">{sortedBills.length}</strong> of {bills.length} bills
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-sky-600" />
            Filter Controls
          </div>
          {(holderFilter !== 'ALL' ||
            ownerFilter !== 'ALL' ||
            stageFilter !== 'ALL' ||
            bandFilter !== 'ALL' ||
            statusFilter !== 'ALL' ||
            categoryFilter !== 'ALL' ||
            selectedLabelId !== 'ALL') && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 hover:underline font-bold flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
          {/* Holder */}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold mb-1">Current Holder</label>
            <select
              value={holderFilter}
              onChange={e => setHolderFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Holders</option>
              {users.filter(u => u.id !== 'user-000').map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Owner */}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold mb-1">Owner (RP)</label>
            <select
              value={ownerFilter}
              onChange={e => setOwnerFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Owners</option>
              {users.filter(u => u.id !== 'user-000').map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Stage */}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold mb-1">Pipeline Stage</label>
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Stages</option>
              <option value="IAD">IAD</option>
              <option value="AO">AO</option>
              <option value="PURCHASE">Purchase</option>
              <option value="JMD">JMD</option>
              <option value="ACCOUNTS">Accounts</option>
              <option value="TALLY">Tally</option>
              <option value="PAYMENT">Payment</option>
            </select>
          </div>

          {/* Age Band */}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold mb-1">Age Band</label>
            <select
              value={bandFilter}
              onChange={e => setBandFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Bands</option>
              <option value="NORMAL">Normal (0-2d)</option>
              <option value="A-3">A-3 (3-4d)</option>
              <option value="A-5">A-5 (5-9d)</option>
              <option value="A-10">A-10 (≥10d)</option>
            </select>
          </div>

          {/* DFR Status */}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold mb-1">DFR Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="ON_HOLD">ON_HOLD</option>
              <option value="TALLY_DONE">TALLY_DONE</option>
              <option value="PAID">PAID</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Categories</option>
              <option value="CREDIT BILL">CREDIT BILL</option>
              <option value="CASH BILL">CASH BILL</option>
            </select>
          </div>

          {/* Multi-Label Filter */}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold mb-1">Multi-Label Tag</label>
            <select
              value={selectedLabelId}
              onChange={e => setSelectedLabelId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Multi-Labels</option>
              {labels.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('gb_no')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>GB No</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('party_name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Supplier Party</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Bill/DC No</th>
                <th
                  onClick={() => handleSort('amount')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Owner (RP)</th>
                <th className="py-3.5 px-4">Current Holder</th>
                <th className="py-3.5 px-4">Stage</th>
                <th
                  onClick={() => handleSort('age_days')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Age (Band)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Multi-Labels</th>
                <th className="py-3.5 px-4">Tally / Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {sortedBills.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No bill records match your current filter selection.
                  </td>
                </tr>
              ) : (
                sortedBills.map(b => (
                  <tr
                    key={b.gb_no}
                    onClick={() => onSelectBill(b)}
                    className="hover:bg-sky-50/50 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-extrabold text-sky-600 group-hover:text-sky-700">
                      GB #{b.gb_no}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{b.party_name}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{b.bill_dc_no}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{b.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{b.owner_name}</td>
                    <td className="py-3 px-4 font-bold text-sky-700">{b.current_holder_name}</td>
                    <td className="py-3 px-4 text-slate-700">{b.current_stage}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-bold border ${ageBandColors[b.age_band]}`}>
                        {b.age_band} ({b.age_days}d)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {b.labels.length === 0 ? (
                          <span className="text-[10px] text-slate-400 italic">—</span>
                        ) : (
                          b.labels.map(l => (
                            <span
                              key={l.id}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: l.color }}
                            >
                              {l.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {b.dfr_status === 'PAID' ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                          PAID
                        </span>
                      ) : b.moved_to_tally ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Tally ({b.tally_age_days ?? 0}d)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Pending Tally
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
    </div>
  );
};
