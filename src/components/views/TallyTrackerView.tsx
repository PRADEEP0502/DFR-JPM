import React, { useState } from 'react';
import { Calculator, CheckCircle2, IndianRupee, Clock, ArrowRight } from 'lucide-react';
import { BillRegisterItem, DfrUser, STAGE_DISPLAY_NAMES } from '../../types/dfr';
import { dfrService } from '../../services/dfrService';

interface TallyTrackerViewProps {
  bills: BillRegisterItem[];
  currentUser: DfrUser;
  onSelectBill: (bill: BillRegisterItem) => void;
  onRefresh: () => void;
}

export const TallyTrackerView: React.FC<TallyTrackerViewProps> = ({
  bills,
  currentUser,
  onSelectBill,
  onRefresh,
}) => {
  const [selectedHeaderId, setSelectedHeaderId] = useState<number | null>(null);
  const [note, setNote] = useState<string>('');

  // Bills awaiting Tally posting (tally_status != EXPORTED/POSTED and not paid)
  const tallyPendingBills = bills
    .filter(
      b =>
        b.tally_status !== 'EXPORTED' &&
        b.tally_status !== 'POSTED' &&
        b.bill_status !== 'PAID' &&
        b.bill_status !== 'CLOSED'
    )
    .sort((a, b) => b.age_days - a.age_days);

  // Bills already exported to Tally
  const tallyExportedBills = bills.filter(
    b => b.tally_status === 'EXPORTED' || b.tally_status === 'POSTED'
  );

  const totalTallyPendingAmount = tallyPendingBills.reduce((sum, b) => sum + b.amount, 0);

  const handleMarkTally = (headerId: number) => {
    dfrService.markMovedToTally(headerId, currentUser.id, note);
    setSelectedHeaderId(null);
    setNote('');
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-16 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 p-4 sm:p-6 rounded-2xl border border-emerald-500 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center font-black shadow-md shrink-0">
            <Calculator className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Tally Posting Tracker Pipeline
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              Tracking bills from ERP Selsoft to Tally export and accounts posting
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-2 text-left md:text-right shrink-0">
          <span className="text-[11px] sm:text-xs text-emerald-100 font-bold uppercase tracking-wider">
            Total Tally Pending Value
          </span>
          <p className="text-xl sm:text-2xl font-black text-white">
            ₹{totalTallyPendingAmount.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Tabs / Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
              Awaiting Tally Export
            </span>
            <p className="text-2xl font-black text-emerald-950 mt-0.5">
              {tallyPendingBills.length} Bills
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs">
            Pending
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Exported to Tally
            </span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {tallyExportedBills.length} Bills
            </p>
          </div>
          <span className="px-3 py-1 bg-sky-100 text-sky-800 font-bold rounded-xl text-xs">
            Exported
          </span>
        </div>
      </div>

      {/* Tally Pending Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="text-xs sm:text-sm font-extrabold text-slate-900">
            Bills Waiting for Tally Posting ({tallyPendingBills.length})
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">Sorted by Age (BR Date)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Header ID</th>
                <th className="py-3.5 px-4">BR No</th>
                <th className="py-3.5 px-4">Supplier Party</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Current Holder</th>
                <th className="py-3.5 px-4">Age (BR Date)</th>
                <th className="py-3.5 px-4 text-right">Human Checkpoint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {tallyPendingBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    All bills have been successfully exported/posted to Tally!
                  </td>
                </tr>
              ) : (
                tallyPendingBills.map(b => (
                  <tr
                    key={b.header_id}
                    onClick={() => onSelectBill(b)}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                      #{b.header_id}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-sky-600">
                      {b.br_no}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{b.supplier}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      ₹{b.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-sky-700 font-bold">
                      {b.current_holder_name}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-600">{b.age_days} Days</td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      {selectedHeaderId === b.header_id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="text"
                            placeholder="Tally voucher / note..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[11px] text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                          <button
                            onClick={() => handleMarkTally(b.header_id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition shadow-xs"
                          >
                            Confirm Move
                          </button>
                          <button
                            onClick={() => setSelectedHeaderId(null)}
                            className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedHeaderId(b.header_id)}
                          className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold text-[11px] rounded-lg transition flex items-center gap-1.5 ml-auto"
                        >
                          <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                          Mark Moved to Tally
                        </button>
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
