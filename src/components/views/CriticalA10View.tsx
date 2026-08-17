import React from 'react';
import { AlertOctagon, ShieldAlert, CheckCircle2, User, Clock, IndianRupee } from 'lucide-react';
import { BillRegisterItem, DfrAlert, DfrUser } from '../../types/dfr';

interface CriticalA10ViewProps {
  bills: BillRegisterItem[];
  alerts: DfrAlert[];
  currentUser: DfrUser;
  onSelectBill: (bill: BillRegisterItem) => void;
  onAcknowledgeAlert: (alertId: number) => void;
}

export const CriticalA10View: React.FC<CriticalA10ViewProps> = ({
  bills,
  alerts,
  currentUser,
  onSelectBill,
  onAcknowledgeAlert,
}) => {
  const criticalBills = bills.filter(b => b.age_band === 'A-10' && b.dfr_status !== 'PAID' && b.dfr_status !== 'CLOSED');
  const criticalAmount = criticalBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-700 to-slate-900 p-6 rounded-2xl border border-red-500 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center font-black shadow-md animate-pulse">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Critical (A-10) Escalation Register
            </h1>
            <p className="text-sm text-red-100/90 mt-1">
              Bills pending ≥ 10 days requiring explicit human acknowledgement & owner follow-up
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-2 text-right">
          <span className="text-xs text-red-100 font-bold uppercase tracking-wider">Total Critical Exposure</span>
          <p className="text-2xl font-black text-white">₹{criticalAmount.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Grid of Critical Cards */}
      {criticalBills.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Zero Critical A-10 Overdue Bills!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All active bills are currently moving through holders within the acceptable 0–9 day timeframe.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {criticalBills.map(bill => {
            const alertObj = alerts.find(a => a.gb_no === bill.gb_no && a.band === 'A-10');
            const isAcked = !!alertObj?.acknowledged_at;

            return (
              <div
                key={bill.gb_no}
                onClick={() => onSelectBill(bill)}
                className="bg-white border border-red-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-red-400 transition cursor-pointer relative group text-slate-900"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded bg-red-100 text-red-800 border border-red-200">
                    GB #{bill.gb_no}
                  </span>
                  <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full animate-pulse">
                    {bill.age_days} Days Pending
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition">
                    {bill.party_name}
                  </h3>
                  <p className="text-xs text-slate-500">Bill/DC: {bill.bill_dc_no}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">Amount:</span>
                    <p className="font-bold text-emerald-600">₹{bill.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">Current Stage:</span>
                    <p className="font-bold text-slate-900">{bill.current_stage}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">Current Custodian:</span>
                    <p className="font-extrabold text-sky-700">{bill.current_holder_name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">RP Owner:</span>
                    <p className="font-medium text-slate-600">{bill.owner_name}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between" onClick={e => e.stopPropagation()}>
                  {isAcked ? (
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => alertObj && onAcknowledgeAlert(alertObj.id)}
                      className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Acknowledge Critical Alert
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
