import React, { useState } from 'react';
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
} from 'lucide-react';
import { BillRegisterItem, DfrUser, STAGE_DISPLAY_NAMES } from '../../types/dfr';
import { dfrService } from '../../services/dfrService';

interface TallyTrackerViewProps {
  bills: BillRegisterItem[];
  currentUser: DfrUser;
  onSelectBill: (bill: BillRegisterItem) => void;
  onRefresh: () => void;
}

type TallyTab = 'awaiting' | 'exported' | 'completed';

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

  // 1. Awaiting Tally Export (Not exported yet, and active)
  const awaitingBills = bills.filter(
    b =>
      b.tally_status !== 'EXPORTED' &&
      b.tally_status !== 'POSTED' &&
      b.dfr_status !== 'TALLY_DONE' &&
      b.bill_status !== 'PAID' &&
      b.bill_status !== 'CLOSED'
  );

  // 2. Exported to Tally (Exported, awaiting posting/completion)
  const exportedBills = bills.filter(
    b =>
      (b.tally_status === 'EXPORTED' || b.dfr_status === 'TALLY_DONE') &&
      b.tally_status !== 'POSTED' &&
      b.bill_status !== 'PAID' &&
      b.bill_status !== 'CLOSED'
  );

  // 3. Tally Posted / Completed
  const completedBills = bills.filter(
    b => b.tally_status === 'POSTED' || b.bill_status === 'PAID' || b.dfr_status === 'PAID'
  );

  const awaitingAmount = awaitingBills.reduce((sum, b) => sum + b.amount, 0);
  const exportedAmount = exportedBills.reduce((sum, b) => sum + b.amount, 0);
  const completedAmount = completedBills.reduce((sum, b) => sum + b.amount, 0);

  const handleMarkTally = (headerId: number) => {
    dfrService.markMovedToTally(headerId, currentUser.id, note);
    setSelectedHeaderId(null);
    setNote('');
    onRefresh();
  };

  const handleCompletePayment = (headerId: number) => {
    dfrService.markPaymentCompleted(headerId, currentUser.id, note);
    setSelectedHeaderId(null);
    setNote('');
    onRefresh();
  };

  const currentList =
    activeTab === 'awaiting'
      ? awaitingBills
      : activeTab === 'exported'
      ? exportedBills
      : completedBills;

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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-500 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center font-black shadow-md shrink-0">
            <Calculator className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Tally Posting Tracker Pipeline
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              Tracking bills from ERP Selsoft to Tally export and accounts disbursement
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-5 py-2.5 text-left md:text-right shrink-0">
          <span className="text-[10px] sm:text-xs text-emerald-100 font-extrabold uppercase tracking-wider block">
            Awaiting Tally Value
          </span>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">
            ₹{awaitingAmount.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* 3 Interactive Section Tabs / Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        
        {/* Tab 1: Awaiting Tally Export */}
        <div
          onClick={() => setActiveTab('awaiting')}
          className={`p-5 rounded-2xl border transition cursor-pointer shadow-xs ${
            activeTab === 'awaiting'
              ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">
              1. Awaiting Tally Export
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-full text-xs">
              {awaitingBills.length}
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ₹{(awaitingAmount / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Bills pending handover to Accounts / Tally
          </p>
        </div>

        {/* Tab 2: Exported to Tally */}
        <div
          onClick={() => setActiveTab('exported')}
          className={`p-5 rounded-2xl border transition cursor-pointer shadow-xs ${
            activeTab === 'exported'
              ? 'bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-800 uppercase tracking-wider">
              2. Exported to Tally
            </span>
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-extrabold rounded-full text-xs">
              {exportedBills.length}
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ₹{(exportedAmount / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Exported to Tally (Excluded from A-10 Critical)
          </p>
        </div>

        {/* Tab 3: Tally Posted / Completed */}
        <div
          onClick={() => setActiveTab('completed')}
          className={`p-5 rounded-2xl border transition cursor-pointer shadow-xs ${
            activeTab === 'completed'
              ? 'bg-teal-50/90 border-teal-400 ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-teal-800 uppercase tracking-wider">
              3. Tally Posted / Paid
            </span>
            <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 font-extrabold rounded-full text-xs">
              {completedBills.length}
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ₹{(completedAmount / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Final bank disbursement completed
          </p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              {activeTab === 'awaiting' && <Clock className="w-5 h-5 text-emerald-600" />}
              {activeTab === 'exported' && <Send className="w-5 h-5 text-indigo-600" />}
              {activeTab === 'completed' && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
              {activeTab === 'awaiting' && `Bills Awaiting Tally Export (${filteredBills.length})`}
              {activeTab === 'exported' && `Bills Exported to Tally (${filteredBills.length})`}
              {activeTab === 'completed' && `Bills Posted & Paid in Tally (${filteredBills.length})`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'exported' &&
                'Note: Exported bills appear in Tally Tracker while remaining excluded from A-10 Critical counts.'}
              {activeTab === 'awaiting' &&
                'Click Mark Moved to Tally to transition active bills into Tally processing.'}
              {activeTab === 'completed' &&
                'Complete ledger history and audit records for settled bills.'}
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
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Header ID</th>
                <th className="py-3 px-4">BR No</th>
                <th className="py-3 px-4">Supplier Party</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Tally Status</th>
                <th className="py-3 px-4">Export Date</th>
                <th className="py-3 px-4">Age (BR Date)</th>
                <th className="py-3 px-4 text-right">Checkpoint Action</th>
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
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                      #{b.header_id}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-sky-700 font-mono">
                      {b.br_no}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{b.supplier}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 font-mono">
                      ₹{b.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          b.tally_status === 'EXPORTED'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : b.tally_status === 'POSTED' || b.bill_status === 'PAID'
                            ? 'bg-teal-100 text-teal-800 border border-teal-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {b.tally_status || (b.bill_status === 'PAID' ? 'POSTED' : 'WAITING')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {b.tally_exported_date
                        ? new Date(b.tally_exported_date).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {b.age_days} Days
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
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
                        <button
                          onClick={() => handleCompletePayment(b.header_id)}
                          className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100 font-bold text-[11px] rounded-xl transition flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                          Mark Paid
                        </button>
                      )}

                      {activeTab === 'completed' && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Paid
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
