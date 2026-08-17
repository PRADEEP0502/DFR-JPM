import React, { useState } from 'react';
import { Calculator, CheckCircle2, Clock, User, ArrowRight, IndianRupee } from 'lucide-react';
import { BillRegisterItem, DfrUser } from '../../types/dfr';
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
  const [selectedGb, setSelectedGb] = useState<number | null>(null);
  const [note, setNote] = useState<string>('');

  // Bills awaiting Tally posting (moved_to_tally = false and not paid/closed)
  const tallyPendingBills = bills
    .filter(b => !b.moved_to_tally && b.dfr_status !== 'PAID' && b.dfr_status !== 'CLOSED')
    .sort((a, b) => b.age_days - a.age_days);

  const totalTallyPendingAmount = tallyPendingBills.reduce((sum, b) => sum + b.amount, 0);

  const handleMarkTally = (gbNo: number) => {
    dfrService.markMovedToTally(gbNo, currentUser.id, note);
    setSelectedGb(null);
    setNote('');
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 p-6 rounded-2xl border border-emerald-500 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center font-black shadow-md">
            <Calculator className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Tally Posting Tracker Pipeline
            </h1>
            <p className="text-sm text-emerald-100/90 mt-1">
              Physical bills pending posting into Tally accounting software
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-2 text-right">
          <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider">
            Total Tally Pending Value
          </span>
          <p className="text-2xl font-black text-white">
            ₹{totalTallyPendingAmount.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Tally Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">GB No</th>
                <th className="py-3.5 px-4">Supplier Party</th>
                <th className="py-3.5 px-4">Bill/DC No</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Current Custodian</th>
                <th className="py-3.5 px-4">Overall Age</th>
                <th className="py-3.5 px-4 text-right">Human Checkpoint Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {tallyPendingBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    All bills have been successfully posted to Tally!
                  </td>
                </tr>
              ) : (
                tallyPendingBills.map(b => (
                  <tr
                    key={b.gb_no}
                    onClick={() => onSelectBill(b)}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-extrabold text-sky-600">GB #{b.gb_no}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{b.party_name}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{b.bill_dc_no}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      ₹{b.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-sky-700 font-bold">{b.current_holder_name}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-600">{b.age_days} Days</td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      {selectedGb === b.gb_no ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="text"
                            placeholder="Tally voucher ref / note..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[11px] text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                          <button
                            onClick={() => handleMarkTally(b.gb_no)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition shadow-xs"
                          >
                            Confirm Move
                          </button>
                          <button
                            onClick={() => setSelectedGb(null)}
                            className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedGb(b.gb_no)}
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
