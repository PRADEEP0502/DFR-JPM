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
  History,
  XCircle,
  ShieldAlert,
} from 'lucide-react';
import {
  BillRegisterItem,
  DfrUser,
  HolderHistory,
  DfrLabel,
  STAGE_DISPLAY_NAMES,
} from '../../types/dfr';
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
  labels,
  currentUser,
  onClose,
  onOpenHandover,
  onRefresh,
}) => {
  const [showLabelPicker, setShowLabelPicker] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');

  const history = dfrService.getHolderHistory(bill.header_id);
  const users = dfrService.getUsers();
  const userMap = new Map(users.map(u => [u.id, u.full_name]));

  const ageBandColors = {
    NORMAL: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'A-3': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'A-5': 'bg-amber-100 text-amber-800 border-amber-200',
    'A-10': 'bg-red-100 text-red-800 border-red-200 font-extrabold animate-pulse',
  };

  const handleToggleLabel = (labelId: string) => {
    dfrService.toggleBillLabel(bill.header_id, labelId);
    onRefresh();
  };

  const handleMoveToTally = () => {
    dfrService.markMovedToTally(bill.header_id, currentUser.id, note);
    onRefresh();
  };

  const handleCompletePayment = () => {
    dfrService.markPaymentCompleted(bill.header_id, currentUser.id, note);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full sm:max-w-xl bg-white sm:border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250 text-slate-900">
        {/* Drawer Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-start sm:items-center justify-between bg-slate-50 gap-2 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-sky-100 text-sky-800 border border-sky-200 tracking-wider">
                {bill.br_no}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                Header #{bill.header_id}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border ${ageBandColors[bill.age_band]}`}>
                {bill.age_band} ({bill.age_days}d)
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-2 truncate">{bill.supplier}</h2>
            <p className="text-xs text-slate-500 font-medium">Invoice No: {bill.bill_no}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition shrink-0 min-h-[36px] min-w-[36px]"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Section 1: BILL INFORMATION */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              Bill Information (ERP)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Header ID:</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">#{bill.header_id}</p>
              </div>
              <div>
                <span className="text-slate-500">BR No (Inward Ref):</span>
                <p className="font-extrabold text-sky-600 mt-0.5">{bill.br_no}</p>
              </div>
              <div>
                <span className="text-slate-500">BR Date (Inward Date):</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{bill.br_date}</p>
              </div>
              <div>
                <span className="text-slate-500">Bill Date (Invoice Date):</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{bill.bill_date}</p>
              </div>
              <div>
                <span className="text-slate-500">Supplier / Party:</span>
                <p className="font-bold text-slate-900 mt-0.5">{bill.supplier}</p>
              </div>
              <div>
                <span className="text-slate-500">Category:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[11px]">
                    {bill.category}
                  </span>
                </p>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Bill Amount:</span>
                <p className="text-lg font-black text-sky-600 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-0.5" />
                  {bill.amount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: ERP INFORMATION */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              ERP Process & Approval Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Approval Status:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      bill.approval_status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : bill.approval_status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {bill.approval_status}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-slate-500">Next Approver:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {bill.next_approver || '—'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Tally Status:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {bill.tally_status || 'WAITING'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Tally Exported Date:</span>
                <p className="font-mono text-slate-800 mt-0.5">
                  {bill.tally_exported_date
                    ? new Date(bill.tally_exported_date).toLocaleDateString()
                    : '—'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Bill Status:</span>
                <p className="font-bold text-slate-900 mt-0.5">{bill.bill_status}</p>
              </div>
              <div>
                <span className="text-slate-500">DFR Tracking Status:</span>
                <p className="font-bold text-slate-900 mt-0.5">{bill.dfr_status}</p>
              </div>
            </div>
          </div>

          {/* Section 3: REJECTION DETAILS (If applicable) */}
          {(bill.rejected_by || bill.rejection_reason || bill.approval_status === 'REJECTED') && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                Rejection Details
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-red-700 font-semibold">Rejected By:</span>
                  <p className="font-bold text-red-950 mt-0.5">{bill.rejected_by || '—'}</p>
                </div>
                <div>
                  <span className="text-red-700 font-semibold">Rejection Reason:</span>
                  <p className="font-medium text-red-950 mt-0.5 italic">
                    {bill.rejection_reason || '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: DFR INTERNAL TRACKING */}
          <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-600" />
              DFR Holder Tracking
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Current Holder:</span>
                <p className="font-extrabold text-sky-800 mt-0.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-600" />
                  {bill.current_holder_name}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Current Stage:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {STAGE_DISPLAY_NAMES[bill.current_stage] || bill.current_stage}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Age from BR Date:</span>
                <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {bill.age_days} Days
                </p>
              </div>
              <div>
                <span className="text-slate-500">Ageing Band:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] border ${ageBandColors[bill.age_band]}`}>
                    {bill.age_band}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Multi-Labels Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-600" />
                Custom Multi-Labels ({bill.labels.length})
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
                    <button onClick={() => handleToggleLabel(l.id)} className="hover:opacity-75">
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

          {/* Section 5: HOLDER HISTORY TIMELINE */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-sky-600" />
              Holder Movement Timeline (dfr_holder_history)
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {history.map(item => {
                const changedByName = userMap.get(item.changed_by) || 'System';
                const toHolderName = userMap.get(item.to_holder_id) || 'User';
                const fromHolderName = item.from_holder_id
                  ? userMap.get(item.from_holder_id)
                  : 'Bill Inward';

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
                        Stage:{' '}
                        <strong className="text-slate-900">
                          {STAGE_DISPLAY_NAMES[item.to_stage] || item.to_stage}
                        </strong>
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
          {bill.bill_status !== 'PAID' && (
            <input
              type="text"
              placeholder="Action note (optional)..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 min-h-[40px]"
            />
          )}

          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            {bill.bill_status !== 'PAID' && (
              <>
                <button
                  onClick={onOpenHandover}
                  className="flex-1 py-3 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs min-h-[44px] touch-manipulation"
                >
                  <ArrowRight className="w-4 h-4" />
                  Handover Bill
                </button>

                {bill.tally_status !== 'EXPORTED' && bill.tally_status !== 'POSTED' && (
                  <button
                    onClick={handleMoveToTally}
                    className="flex-1 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs min-h-[44px] touch-manipulation"
                  >
                    <Calculator className="w-4 h-4" />
                    Move to Tally
                  </button>
                )}

                {(bill.tally_status === 'EXPORTED' || bill.tally_status === 'POSTED') && (
                  <button
                    onClick={handleCompletePayment}
                    className="flex-1 py-3 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs min-h-[44px] touch-manipulation"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Paid & Close
                  </button>
                )}
              </>
            )}

            {bill.bill_status === 'PAID' && (
              <div className="w-full py-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 min-h-[44px]">
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
