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
  FileText,
  Layers,
  Send,
  ArrowRightCircle,
  Activity,
  Check,
} from 'lucide-react';
import {
  BillRegisterItem,
  DfrUser,
  HolderHistory,
  DfrLabel,
  STAGE_DISPLAY_NAMES,
} from '../../types/dfr';
import { dfrService } from '../../services/dfrService';

const formatAuditDateTime = (dateStr: string) => {
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
    NORMAL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'A-3': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'A-5': 'bg-amber-50 text-amber-700 border-amber-200',
    'A-10': 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold',
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
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-5xl xl:max-w-6xl max-h-[94vh] bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900">
        
        {/* Executive Modal Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 gap-3 shrink-0">
          <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 border border-sky-200 font-mono tracking-wider">
                  {bill.br_no}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-200/80 text-slate-700">
                  Header #{bill.header_id}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${ageBandColors[bill.age_band]}`}>
                  {bill.age_band} ({bill.age_days} Days Pending)
                </span>
              </div>

              <div className="flex items-baseline gap-3 mt-1.5">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                  {bill.supplier}
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  Inv: <strong className="text-slate-700 font-semibold">{bill.bill_no}</strong>
                </span>
              </div>
            </div>

            {/* Prominent Amount Display in Header */}
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Bill Amount
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                ₹{bill.amount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition shrink-0 cursor-pointer shadow-2xs"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spacious 2-Column Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: ERP & Process Master Info (Span 6 / 12) */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Section 1: Bill Master Information */}
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  Bill Master Information (ERP)
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">Header ID</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">#{bill.header_id}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">BR No (Inward Ref)</span>
                    <p className="font-mono font-black text-sky-700 mt-0.5">{bill.br_no}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">BR Date (Inward)</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{formatDateOnly(bill.br_date)}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">Bill Date (Invoice)</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{formatDateOnly(bill.bill_date)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">Supplier / Party</span>
                    <p className="font-extrabold text-slate-900 mt-0.5 text-sm">{bill.supplier}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">Category</span>
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-xs mt-1">
                      {bill.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">Invoice No</span>
                    <p className="font-mono font-bold text-slate-900 mt-1">{bill.bill_no}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: ERP Workflow & Approval */}
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  ERP Process & Approval Status
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">Approval Status</span>
                    <div className="mt-1">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-extrabold inline-block ${
                          bill.approval_status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bill.approval_status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {bill.approval_status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">Next Approver</span>
                    <p className="font-extrabold text-slate-900 mt-1.5">{bill.next_approver || '—'}</p>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">Tally Status</span>
                    <p className="font-extrabold text-slate-900 mt-1">{bill.tally_status || 'WAITING'}</p>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">Tally Exported Date</span>
                    <p className="font-mono text-slate-700 mt-1">
                      {formatDateOnly(bill.tally_exported_date)}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">Bill Status</span>
                    <p className="font-extrabold text-slate-900 mt-1">{bill.bill_status}</p>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">DFR Tracking State</span>
                    <p className="font-extrabold text-sky-700 mt-1">{bill.dfr_status}</p>
                  </div>
                </div>
              </div>

              {/* Multi-Labels Section */}
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4 text-sky-600" />
                    Custom Multi-Labels ({bill.labels.length})
                  </h3>
                  <button
                    onClick={() => setShowLabelPicker(!showLabelPicker)}
                    className="text-xs text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1 bg-sky-100 hover:bg-sky-200 border border-sky-200 px-2.5 py-1 rounded-xl transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Manage Tags
                  </button>
                </div>

                {/* Label Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {bill.labels.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No tags attached</span>
                  ) : (
                    bill.labels.map(l => (
                      <span
                        key={l.id}
                        className="text-xs font-bold px-3 py-1 rounded-full text-white flex items-center gap-1.5 shadow-2xs"
                        style={{ backgroundColor: l.color }}
                      >
                        {l.name}
                        <button onClick={() => handleToggleLabel(l.id)} className="hover:opacity-75 cursor-pointer font-black ml-0.5">
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Label Picker dropdown */}
                {showLabelPicker && (
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <p className="text-[11px] text-slate-500 font-semibold">Select labels to toggle on this bill:</p>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                      {labels.map(l => {
                        const isAttached = bill.labels.some(x => x.id === l.id);
                        return (
                          <button
                            key={l.id}
                            onClick={() => handleToggleLabel(l.id)}
                            className={`text-xs font-bold px-3 py-1 rounded-xl border transition cursor-pointer ${
                              isAttached
                                ? 'bg-sky-600 text-white border-sky-500'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
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
            </div>

            {/* RIGHT COLUMN: Custody, Action Center & Movement History (Span 6 / 12) */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Current Custodian & Quick Action Center */}
              <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-sky-900 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-600" />
                    Bill Movement
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-200">
                    Active Handover
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-sky-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Current Holder</span>
                    <p className="text-sm font-black text-sky-800 mt-0.5 truncate">{bill.current_holder_name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Current Stage</span>
                    <p className="text-sm font-black text-slate-900 mt-0.5 truncate">
                      {STAGE_DISPLAY_NAMES[bill.current_stage] || bill.current_stage}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Age</span>
                    <p className="text-sm font-black text-amber-700 mt-0.5 font-mono">
                      {bill.age_days} Days
                    </p>
                  </div>
                </div>

                {/* Handover Action Form */}
                {bill.bill_status !== 'PAID' && (
                  <div className="space-y-3 pt-1">
                    <input
                      type="text"
                      placeholder="Add an optional handover note..."
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={onOpenHandover}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Handover Bill</span>
                      </button>

                      {bill.tally_status !== 'EXPORTED' && bill.tally_status !== 'POSTED' && (
                        <button
                          onClick={handleMoveToTally}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                        >
                          <Calculator className="w-4 h-4" />
                          <span>Move to Tally</span>
                        </button>
                      )}

                      {(bill.tally_status === 'EXPORTED' || bill.tally_status === 'POSTED') && (
                        <button
                          onClick={handleCompletePayment}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Paid & Close</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Redesigned Custody Movement Audit Trail */}
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-sky-600" />
                    Movement History
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200/80 text-slate-700">
                    {history.length} Event{history.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 max-h-[350px] overflow-y-auto pr-1">
                  {history.map(item => {
                    const changedByName = userMap.get(item.changed_by) || 'System';
                    const toHolderName = userMap.get(item.to_holder_id) || 'User';
                    const fromHolderName = item.from_holder_id
                      ? userMap.get(item.from_holder_id)
                      : 'Bill Inward';

                    return (
                      <div key={item.id} className="relative group">
                        {/* Timeline Node Icon */}
                        <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-sky-600 border-2 border-white ring-2 ring-sky-200 shadow-2xs" />
                        
                        {/* Refined Timeline Card */}
                        <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-2.5 shadow-2xs hover:border-slate-300 transition">
                          
                          {/* From -> To Row */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                                {fromHolderName}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                              <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-xs font-black border border-sky-200">
                                {toHolderName}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-400 font-mono font-bold">
                                {formatAuditDateTime(item.changed_at)}
                              </span>
                            </div>
                          </div>

                          {/* Stage Name */}
                          <div className="text-xs text-slate-600 flex items-center gap-1.5">
                            <span className="text-slate-400 font-medium">Checkpoint Stage:</span>
                            <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                              {STAGE_DISPLAY_NAMES[item.to_stage] || item.to_stage}
                            </span>
                          </div>

                          {/* Action Note / Reason */}
                          {item.note && (
                            <div className="text-xs text-slate-700 bg-slate-50/90 border-l-2 border-sky-500 px-3 py-2 rounded-r-lg font-medium">
                              {item.note}
                            </div>
                          )}

                          {/* Actor Subtitle */}
                          <div className="text-[11px] text-slate-400 font-medium pt-0.5 flex items-center justify-between">
                            <span>Actor: <strong className="text-slate-700">{item.source === 'ERP Sync' ? 'Selsoft ERP Sync Automation' : changedByName}</strong></span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
