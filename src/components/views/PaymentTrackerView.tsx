import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Clock, Calculator, IndianRupee, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BillRegisterItem, DfrUser } from '../../types/dfr';
import { dfrService } from '../../services/dfrService';

interface PaymentTrackerViewProps {
  bills: BillRegisterItem[];
  currentUser: DfrUser;
  onSelectBill: (bill: BillRegisterItem) => void;
  onRefresh: () => void;
}

export const PaymentTrackerView: React.FC<PaymentTrackerViewProps> = ({
  bills,
  currentUser,
  onSelectBill,
  onRefresh,
}) => {
  const [selectedGb, setSelectedGb] = useState<number | null>(null);
  const [note, setNote] = useState<string>('');

  // Bills in Tally awaiting payment
  const paymentPendingBills = bills
    .filter(b => b.moved_to_tally && b.payment_status !== 'COMPLETED' && b.dfr_status !== 'PAID')
    .sort((a, b) => (b.tally_age_days ?? 0) - (a.tally_age_days ?? 0));

  const totalPaymentPendingAmount = paymentPendingBills.reduce((sum, b) => sum + b.amount, 0);

  const handleCompletePayment = (gbNo: number) => {
    dfrService.markPaymentCompleted(gbNo, currentUser.id, note);
    setSelectedGb(null);
    setNote('');

    // Trigger celebration confetti for payment completion
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // fallback
    }

    onRefresh();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-sky-700 to-slate-900 p-6 rounded-2xl border border-indigo-500 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-indigo-600 flex items-center justify-center font-black shadow-md">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Payment Completion Pipeline
            </h1>
            <p className="text-sm text-indigo-100/90 mt-1">
              Bills posted in Tally software awaiting final bank disbursement & voucher closing
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-2 text-right">
          <span className="text-xs text-indigo-100 font-bold uppercase tracking-wider">
            Total Pending Disbursement
          </span>
          <p className="text-2xl font-black text-white">
            ₹{totalPaymentPendingAmount.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Payment Table with Dual Ageing */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">GB No</th>
                <th className="py-3.5 px-4">Supplier Party</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Tally Posted Date</th>
                <th className="py-3.5 px-4">Tally Ageing</th>
                <th className="py-3.5 px-4">Overall Bill Age</th>
                <th className="py-3.5 px-4 text-right">Human Checkpoint Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {paymentPendingBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    All Tally-posted bills have completed bank payment!
                  </td>
                </tr>
              ) : (
                paymentPendingBills.map(b => (
                  <tr
                    key={b.gb_no}
                    onClick={() => onSelectBill(b)}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-extrabold text-sky-600">GB #{b.gb_no}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{b.party_name}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      ₹{b.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {b.tally_posted_at ? new Date(b.tally_posted_at).toLocaleDateString() : 'N/A'}
                    </td>
                    {/* Separate Tally Ageing Chip */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-extrabold">
                        {b.tally_age_days ?? 0} Days in Tally
                      </span>
                    </td>
                    {/* Overall Bill Age */}
                    <td className="py-3.5 px-4 font-semibold text-slate-500">
                      {b.age_days} Days Total
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      {selectedGb === b.gb_no ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="text"
                            placeholder="Bank Txn Ref / Note..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[11px] text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                          <button
                            onClick={() => handleCompletePayment(b.gb_no)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg transition shadow-xs"
                          >
                            Confirm Paid
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
                          className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100 font-bold text-[11px] rounded-lg transition flex items-center gap-1.5 ml-auto"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                          Mark Payment Completed
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
