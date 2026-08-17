import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';
import { BillRegisterItem, DfrUser, ProcessStage } from '../../types/dfr';

interface HandoverModalProps {
  bill: BillRegisterItem;
  users: DfrUser[];
  currentUser: DfrUser;
  onClose: () => void;
  onConfirm: (toHolderId: string, toStage: ProcessStage, note: string) => void;
}

const STAGES: { id: ProcessStage; label: string }[] = [
  { id: 'IAD', label: 'IAD — Initial Inward' },
  { id: 'AO', label: 'AO — Admin Officer' },
  { id: 'PURCHASE', label: 'Purchase Department' },
  { id: 'JMD', label: 'JMD — Joint MD Office' },
  { id: 'ACCOUNTS', label: 'Accounts Department' },
  { id: 'TALLY', label: 'Tally Entry' },
  { id: 'PAYMENT', label: 'Payment Processing' },
];

export const HandoverModal: React.FC<HandoverModalProps> = ({
  bill,
  users,
  currentUser,
  onClose,
  onConfirm,
}) => {
  const [selectedHolderId, setSelectedHolderId] = useState<string>(bill.current_holder_id);
  const [selectedStage, setSelectedStage] = useState<ProcessStage>(bill.current_stage);
  const [note, setNote] = useState<string>('');

  const selectedHolder = users.find(u => u.id === selectedHolderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHolderId) return;
    onConfirm(selectedHolderId, selectedStage, note);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                GB #{bill.gb_no}
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">Confirm Custody Handover</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Human Checkpoint: Write permanent physical audit record
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Current Custody Visual */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 text-[11px] font-bold uppercase">Current Custodian</span>
              <p className="font-extrabold text-slate-900 mt-0.5">{bill.current_holder_name}</p>
              <p className="text-slate-500 text-[11px]">Stage: {bill.current_stage}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-sky-600" />
            <div className="text-right">
              <span className="text-slate-500 text-[11px] font-bold uppercase">New Recipient</span>
              <p className="font-extrabold text-sky-700 mt-0.5">{selectedHolder?.full_name || 'Select'}</p>
              <p className="text-slate-500 text-[11px]">Stage: {selectedStage}</p>
            </div>
          </div>

          {/* Select New Holder */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Next Holder / Person <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedHolderId}
              onChange={e => setSelectedHolderId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              required
            >
              {users
                .filter(u => u.id !== 'user-000')
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role})
                  </option>
                ))}
            </select>
          </div>

          {/* Select Next Stage */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Next Stage <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value as ProcessStage)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              required
            >
              {STAGES.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Handover Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Handover Remarks / Reason
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Physical bill transferred for rate verification..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 h-20 resize-none"
            />
          </div>

          {/* Human Checkpoint Confirmation Badge */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-sky-900">
            <UserCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Human Checkpoint Action:</span>
              <p className="text-slate-700 text-[11px] mt-0.5">
                Signing as <strong className="text-slate-900">{currentUser.full_name}</strong> ({currentUser.role}). This will append an un-editable row into <code className="text-sky-700 font-semibold">dfr.holder_history</code>.
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-sm font-bold shadow-md shadow-sky-500/20 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Handover
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
