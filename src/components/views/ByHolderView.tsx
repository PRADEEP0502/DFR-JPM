import React from 'react';
import { Users, User, IndianRupee, Clock, AlertTriangle } from 'lucide-react';
import { BillRegisterItem, DfrUser, STAGE_DISPLAY_NAMES } from '../../types/dfr';
import { ViewTab } from '../layout/Sidebar';

interface ByHolderViewProps {
  bills: BillRegisterItem[];
  users: DfrUser[];
  onSelectTab: (tab: ViewTab) => void;
  onSelectBill: (bill: BillRegisterItem) => void;
}

export const ByHolderView: React.FC<ByHolderViewProps> = ({
  bills,
  users,
  onSelectBill,
}) => {
  // Exclude closed/paid bills from active holder counts
  const activeBills = bills.filter(
    b => b.bill_status !== 'PAID' && b.bill_status !== 'CLOSED' && b.dfr_status !== 'PAID'
  );

  const excludedUsernames = new Set([
    'gm',
    'md_mam',
    'md',
    'dfr_admin',
    'admin',
  ]);

  const excludedFullNames = new Set([
    'GM',
    'MD_MAM',
    'MD MAM',
    'MD',
    'DFR_ADMIN',
    'DFR ADMIN',
    'SUPER ADMIN',
    'SYSTEM ADMIN',
  ]);

  const activeUsers = users.filter(u => {
    if (u.id === 'user-000' || u.id === 'user-006' || u.id === 'user-008' || u.id === 'user-009' || u.id === 'user-010') {
      return false;
    }
    if (excludedUsernames.has(u.username?.toLowerCase().trim())) {
      return false;
    }
    if (excludedFullNames.has(u.full_name?.toUpperCase().trim())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16 max-w-full overflow-hidden">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />
          Pending Bills by Current Holder
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Person-wise workload summary showing pending bill count, total exposure amount, and oldest sitting bill based on BR Date
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {activeUsers.map(user => {
          const isIad = user.username?.toLowerCase() === 'iad' || user.full_name?.toUpperCase() === 'IAD' || user.id === 'user-004';
          const isAo = user.username?.toLowerCase() === 'ao' || user.full_name?.toUpperCase() === 'AO' || user.id === 'user-005';
          const isJmd = user.username?.toLowerCase() === 'jmd' || user.full_name?.toUpperCase() === 'JMD' || user.id === 'user-007';
          const isAccounts =
            user.username?.toLowerCase() === 'accounts' ||
            user.full_name?.toUpperCase() === 'ACCOUNTS' ||
            user.department === 'ACCOUNTS' ||
            user.id === 'user-011' ||
            user.id === 'user-accounts';

          const personBills = activeBills.filter(b => {
            if (isIad) return b.current_stage === 'IAD' || b.current_holder_name === 'IAD';
            if (isAo) return b.current_stage === 'AO' || b.current_holder_name === 'AO';
            if (isJmd) return b.current_stage === 'JMD' || b.current_holder_name === 'JMD';
            if (isAccounts) {
              // ALL bills that have reached ACCOUNTS / TALLY stage and are waiting to be exported to Tally
              return (
                (b.current_stage === 'ACCOUNTS' ||
                  b.current_stage === 'TALLY' ||
                  b.current_holder_name?.toUpperCase().includes('ACCOUNT') ||
                  b.next_approver?.toUpperCase().includes('ACCOUNT') ||
                  b.approval_status === 'APPROVED') &&
                b.tally_status !== 'EXPORTED' &&
                b.tally_status !== 'POSTED' &&
                b.dfr_status !== 'TALLY_DONE'
              );
            }

            // Purchase / Bill Inward Staff: ONLY show bills currently at Bill Inward stage!
            // Any bill that has progressed to IAD, AO, JMD, ACCOUNTS, or TALLY is strictly excluded!
            return (
              (b.current_holder_id === user.id || b.current_holder_name?.toUpperCase() === user.full_name?.toUpperCase()) &&
              b.current_stage === 'BILL_INWARD' &&
              b.tally_status !== 'EXPORTED' &&
              b.tally_status !== 'POSTED' &&
              b.dfr_status !== 'TALLY_DONE'
            );
          });
          const totalAmount = personBills.reduce((sum, b) => sum + b.amount, 0);
          const oldestAge = personBills.reduce((max, b) => Math.max(max, b.age_days), 0);
          const criticalCount = personBills.filter(b => b.age_band === 'A-10').length;

          return (
            <div
              key={user.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 hover:border-slate-300 transition text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center font-black text-lg">
                    {user.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{user.full_name}</h3>
                    <span className="text-[11px] text-slate-500 font-bold uppercase">{user.role}</span>
                  </div>
                </div>

                {criticalCount > 0 && (
                  <span className="px-2.5 py-1 rounded bg-red-100 text-red-700 border border-red-200 text-xs font-bold animate-pulse">
                    {criticalCount} Critical
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Bills</span>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{personBills.length}</p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Amount</span>
                  <p className="text-sm font-black text-emerald-600 mt-1">
                    ₹{(totalAmount / 1000).toFixed(0)}k
                  </p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Max Age</span>
                  <p className="text-sm font-black text-amber-600 mt-1">{oldestAge}d</p>
                </div>
              </div>

              {/* Sample list of bills */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Held Bills List
                </span>
                {personBills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No pending bills currently held.</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {personBills.map(b => (
                      <div
                        key={b.header_id}
                        onClick={() => onSelectBill(b)}
                        className="bg-slate-50 border border-slate-200 hover:border-sky-400 p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition"
                      >
                        <div>
                          <span className="font-bold text-sky-700">{b.br_no}</span>
                          <span className="text-slate-800 font-semibold ml-2 truncate max-w-[120px] inline-block align-bottom">
                            {b.supplier}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">
                          ₹{b.amount.toLocaleString('en-IN')} ({b.age_days}d)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
