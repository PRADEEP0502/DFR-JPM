import React, { useState } from 'react';
import {
  X,
  Clock,
  User,
  Building2,
  Calendar,
  IndianRupee,
  Tag,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  CreditCard,
  History
} from 'lucide-react';
import { BillRegisterItem, DfrUser, HolderHistory, DfrLabel } from '../../types/dfr';
import { dfrService } from '../../services/dfrService';

interface BillDetailDrawerProps {
  bill: BillRegisterItem;
  users: DfrUser[];
  labels: DfrLabel[];
  currentUser: DfrUser;
  onClose: () => void;
  onOpenHandover: () => void;
  onRefresh: () => void;
}

export const BillDetailDrawer: React.FC<BillDetailDrawerProps> = ({
  bill,
  users,
  labels,
  currentUser,
  onClose,
  onOpenHandover,
  onRefresh,
}) => {
  const [showLabelPicker, setShowLabelPicker] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');

  const history = dfrService.getHolderHistory(bill.gb_no);
  const userMap = new Map(users.map(u => [u.id, u.full_name]));

  const ageBandColors = {
    NORMAL: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'A-3': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'A-5': 'bg-amber-100 text-amber-800 border-amber-200',
    'A-10': 'bg-red-100 text-red-800 border-red-200 font-extrabold animate-pulse',
  };

  const handleToggleLabel = (labelId: string) => {
    dfrService.toggleBillLabel(bill.gb_no, labelId);
    onRefresh();
  };

  const handleMoveToTally = () => {
    dfrService.markMovedToTally(bill.gb_no, currentUser.id, note);
    onRefresh();
  };

  const handleCompletePayment = () => {
    dfrService.markPaymentCompleted(bill.gb_no, currentUser.id, note);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250 text-slate-900">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-sky-100 text-sky-800 border border-sky-200 tracking-wider">
                GB #{bill.gb_no}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded border ${ageBandColors[bill.age_band]}`}>
                {bill.age_band} ({bill.age_days} days)
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                {bill.dfr_status}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mt-2">{bill.party_name}</h2>
            <p className="text-xs text-slate-500 font-medium">Bill/DC No: {bill.bill_dc_no}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs text-slate-500 font-semibold">Bill Amount</span>
              <p className="text-xl font-black text-sky-600 mt-0.5 flex items-center">
                <IndianRupee className="w-4 h-4 mr-0.5" />
                {bill.amount.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-slate-500 font-bold">{bill.category}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs text-slate-500 font-semibold">Overall Ageing</span>
              <p className="text-xl font-black text-slate-900 mt-0.5 flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                {bill.age_days} Days
              </p>
              <span className="text-[10px] text-slate-500">Recd: {bill.effective_recd_date}</span>
            </div>
          </div>

          {/* Tally Ageing Highlight (If moved to Tally) */}
          {bill.moved_to_tally && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Separate Tally Ageing
                </span>
                <p className="text-base font-black text-emerald-900 mt-0.5">
                  {bill.tally_age_days ?? 0} Days pending in Tally
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Posted: {bill.tally_posted_at ? new Date(bill.tally_posted_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <Calculator className="w-8 h-8 text-emerald-600 opacity-80" />
            </div>
          )}

          {/* Custody Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custody & Ownership</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Responsible Person (RP / Owner):</span>
                <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-600" />
                  {bill.owner_name}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Current Custodian:</span>
                <p className="font-extrabold text-sky-700 mt-0.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  {bill.current_holder_name}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Current Pipeline Stage:</span>
                <p className="font-bold text-slate-900 mt-0.5">{bill.current_stage}</p>
              </div>
              <div>
                <span className="text-slate-500">Payment Status:</span>
                <p className="font-bold text-slate-900 mt-0.5">{bill.payment_status}</p>
              </div>
            </div>
          </div>

          {/* Multi-Labels Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-600" />
                Multi-Labels ({bill.labels.length})
              </h3>
              <button
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className="text-xs text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1 bg-sky-100 border border-sky-200 px-2 py-1 rounded-lg"
              >
                <Plus className="w-3 h-3" />
                Manage Tags
              </button>
            </div>

            {/* Label Chips */}
            <div className="flex flex-wrap gap-1.5">
              {bill.labels.length === 0 ? (
                <span className="text-xs text-slate-500 italic">No labels attached</span>
              ) : (
                bill.labels.map(l => (
                  <span
                    key={l.id}
                    className="text-xs font-bold px-2.5 py-1 rounded-full text-white flex items-center gap-1.5 shadow-2xs"
                    style={{ backgroundColor: l.color }}
                  >
                    {l.name}
                    <button
                      onClick={() => handleToggleLabel(l.id)}
                      className="hover:opacity-75"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Label Picker dropdown */}
            {showLabelPicker && (
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <p className="text-[11px] text-slate-500 font-semibold">Select labels to toggle:</p>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {labels.map(l => {
                    const isAttached = bill.labels.some(x => x.id === l.id);
                    return (
                      <button
                        key={l.id}
                        onClick={() => handleToggleLabel(l.id)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition ${
                          isAttached
                            ? 'bg-sky-600 text-white border-sky-500'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {isAttached ? '✓ ' : '+ '}
                        {l.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Custody History Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-sky-600" />
              Custody Timeline (dfr.holder_history)
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {history.map((item, idx) => {
                const changedByName = userMap.get(item.changed_by) || 'User';
                const toHolderName = userMap.get(item.to_holder_id) || 'User';
                const fromHolderName = item.from_holder_id ? userMap.get(item.from_holder_id) : 'Intake';

                return (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-sky-500 border-2 border-white ring-2 ring-sky-200" />
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">
                          {fromHolderName} → {toHolderName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.changed_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Stage: <strong className="text-slate-900">{item.to_stage}</strong>
                      </p>
                      {item.note && (
                        <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200 italic text-[11px]">
                          "{item.note}"
                        </p>
                      )}
                      <p className="text-[10px] text-slate-500 font-semibold pt-1">
                        Confirmed by: {changedByName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Actions Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          {/* Action Note optional text */}
          {bill.dfr_status !== 'PAID' && bill.dfr_status !== 'CLOSED' && (
            <input
              type="text"
              placeholder="Action note (optional)..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
            />
          )}

          <div className="flex items-center gap-2">
            {bill.dfr_status !== 'PAID' && bill.dfr_status !== 'CLOSED' && (
              <>
                <button
                  onClick={onOpenHandover}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Handover Custody
                </button>

                {!bill.moved_to_tally && (
                  <button
                    onClick={handleMoveToTally}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    Move to Tally
                  </button>
                )}

                {bill.moved_to_tally && bill.payment_status !== 'COMPLETED' && (
                  <button
                    onClick={handleCompletePayment}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Complete Payment
                  </button>
                )}
              </>
            )}

            {bill.dfr_status === 'PAID' && (
              <div className="w-full py-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Payment Completed & Closed
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
