import React, { useMemo } from 'react';
import {
  Users,
  AlertOctagon,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { BillRegisterItem, DfrUser, isTallyExported, isBillHeldByUser } from '../../types/dfr';
import { ViewTab } from '../layout/Sidebar';
import { Card3D } from '../ui/Card3D';

interface ByHolderViewProps {
  bills: BillRegisterItem[];
  users: DfrUser[];
  onSelectTab?: (tab: ViewTab) => void;
  onSelectBill?: (bill: BillRegisterItem) => void;
  onSelectHolder?: (holderId: string) => void;
}

export const ByHolderView: React.FC<ByHolderViewProps> = ({
  bills,
  users,
  onSelectHolder,
}) => {
  const activeBills = useMemo(() => bills.filter(b => !isTallyExported(b)), [bills]);

  const excludedUsernames = useMemo(
    () => new Set(['gm', 'md_mam', 'md', 'dfr_admin', 'admin']),
    []
  );

  const excludedFullNames = useMemo(
    () =>
      new Set([
        'GM',
        'MD_MAM',
        'MD MAM',
        'MD',
        'DFR_ADMIN',
        'DFR ADMIN',
        'SUPER ADMIN',
        'SYSTEM ADMIN',
      ]),
    []
  );

  const activeUsers = useMemo(() => {
    return users.filter(u => {
      if (
        u.id === 'user-000' ||
        u.id === 'user-006' ||
        u.id === 'user-008' ||
        u.id === 'user-009' ||
        u.id === 'user-010'
      ) {
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
  }, [users, excludedUsernames, excludedFullNames]);

  const sortedUserWorkload = useMemo(() => {
    const list = activeUsers.map(user => {
      const personBills = activeBills.filter(b => isBillHeldByUser(b, user));
      const totalAmount = personBills.reduce((sum, b) => sum + b.amount, 0);
      const oldestAge = personBills.reduce((max, b) => Math.max(max, b.age_days), 0);
      const criticalCount = personBills.filter(b => b.age_band === 'A-10').length;

      return {
        user,
        personBills,
        totalAmount,
        oldestAge,
        criticalCount,
      };
    });

    return list.sort((a, b) => {
      if (b.personBills.length !== a.personBills.length) {
        return b.personBills.length - a.personBills.length;
      }
      return b.totalAmount - a.totalAmount;
    });
  }, [activeUsers, activeBills]);

  // Aggregate stats
  const totalPendingBills = useMemo(
    () => sortedUserWorkload.reduce((sum, item) => sum + item.personBills.length, 0),
    [sortedUserWorkload]
  );
  const totalExposureAmount = useMemo(
    () => sortedUserWorkload.reduce((sum, item) => sum + item.totalAmount, 0),
    [sortedUserWorkload]
  );
  const totalCriticalBills = useMemo(
    () => sortedUserWorkload.reduce((sum, item) => sum + item.criticalCount, 0),
    [sortedUserWorkload]
  );

  const formatAmountK = (amount: number): string => {
    if (amount === 0) return '₹0';
    if (amount >= 1000) {
      return `₹${Math.round(amount / 1000)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleOpenHolderBills = (userId: string) => {
    if (onSelectHolder) {
      onSelectHolder(userId);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-16 max-w-full overflow-hidden text-slate-900 font-sans">
      {/* Top Executive Banner (Optimized for Tablet & Desktop) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-5 sm:p-6 md:p-7 text-white shadow-2xl border border-sky-500/20 flex flex-col xl:flex-row xl:items-center justify-between gap-5 sm:gap-6">
        {/* Banner Left: Icon + Title */}
        <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0 shadow-lg shadow-sky-500/20">
            <Users className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight whitespace-normal">
              Pending Bills by Current Holder
            </h1>
          </div>
        </div>

        {/* Banner Right: 4 Executive Badges in Responsive Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 px-3.5 sm:px-4 py-2.5 rounded-2xl shadow-xs">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">
              Custodians
            </span>
            <p className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
              {sortedUserWorkload.length}
            </p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 px-3.5 sm:px-4 py-2.5 rounded-2xl shadow-xs">
            <span className="text-[10px] text-sky-400 uppercase font-extrabold tracking-wider block">
              Pending Bills
            </span>
            <p className="text-lg sm:text-xl font-black text-sky-400 font-mono mt-0.5">
              {totalPendingBills}
            </p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 px-3.5 sm:px-4 py-2.5 rounded-2xl shadow-xs">
            <span className="text-[10px] text-emerald-400 uppercase font-extrabold tracking-wider block">
              Exposure Value
            </span>
            <p className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-0.5">
              ₹{(totalExposureAmount / 100000).toFixed(2)}L
            </p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 px-3.5 sm:px-4 py-2.5 rounded-2xl shadow-xs">
            <span className="text-[10px] text-rose-400 uppercase font-extrabold tracking-wider block">
              Critical (A-10)
            </span>
            <p className="text-lg sm:text-xl font-black text-rose-400 font-mono mt-0.5">
              {totalCriticalBills}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Container: Clean, Compact 7-Column View */}
      <Card3D noTilt={true} glowColor="rgba(2, 132, 199, 0.15)" className="p-0 overflow-hidden border border-slate-200/90 shadow-md">
        {/* Table Header Controls / Title */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                Current Holder Leaderboard
              </h2>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Click any row or &quot;View Bills&quot; to inspect bills in the Master Register
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
              Sorted by: <strong className="text-sky-700">Pending Bills (Desc)</strong>
            </span>
          </div>
        </div>

        {sortedUserWorkload.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <span>No active holders found. All bills are fully processed!</span>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet View (7-Column Table) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[680px] border-collapse">
                <thead className="bg-slate-100/95 text-slate-600 uppercase tracking-wider font-extrabold text-[11px] border-b border-slate-200 sticky top-0 z-10 backdrop-blur">
                  <tr>
                    {/* 1. Rank */}
                    <th className="py-3.5 px-3 sm:px-4 w-14 text-center">Rank</th>
                    {/* 2. Current Holder */}
                    <th className="py-3.5 px-3 sm:px-4 min-w-[150px]">Current Holder</th>
                    {/* 3. Pending Bills */}
                    <th className="py-3.5 px-3 sm:px-4 w-28">Pending Bills</th>
                    {/* 4. Pending Amount */}
                    <th className="py-3.5 px-3 sm:px-4 w-32">Pending Amount</th>
                    {/* 5. Max Age */}
                    <th className="py-3.5 px-3 sm:px-4 w-24">Max Age</th>
                    {/* 6. Critical A-10 Count */}
                    <th className="py-3.5 px-3 sm:px-4 w-32">Critical A-10 Count</th>
                    {/* 7. Action */}
                    <th className="py-3.5 px-3 sm:px-4 w-28 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800 bg-white">
                  {sortedUserWorkload.map(
                    (
                      { user, personBills, totalAmount, oldestAge, criticalCount },
                      index
                    ) => {
                      return (
                        <tr
                          key={user.id}
                          onClick={() => handleOpenHolderBills(user.id)}
                          className="hover:bg-sky-50/70 hover:shadow-xs transition-all duration-150 group cursor-pointer"
                        >
                          {/* 1. Rank */}
                          <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center justify-center font-black text-xs px-2.5 py-1 rounded-lg border shadow-2xs font-mono transition-transform duration-150 group-hover:scale-105 ${
                                index === 0
                                  ? 'bg-amber-500/15 text-amber-800 border-amber-400/50 ring-1 ring-amber-400/30'
                                  : index === 1
                                  ? 'bg-slate-200/90 text-slate-800 border-slate-300'
                                  : index === 2
                                  ? 'bg-amber-700/10 text-amber-900 border-amber-600/30'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              #{index + 1}
                            </span>
                          </td>

                          {/* 2. Current Holder */}
                          <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0 group-hover:from-sky-600 group-hover:to-indigo-700 transition-colors">
                                {user.full_name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <span className="font-extrabold text-slate-900 text-sm tracking-tight block uppercase truncate group-hover:text-sky-700 transition-colors">
                                  {user.full_name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block truncate">
                                  {user.role}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 3. Pending Bills */}
                          <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base font-black text-slate-900 font-mono">
                                {personBills.length}
                              </span>
                              <span className="text-[11px] text-slate-400 font-bold">
                                bills
                              </span>
                            </div>
                          </td>

                          {/* 4. Pending Amount */}
                          <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                            <div>
                              <span className="text-sm font-black text-emerald-600 font-mono tracking-tight block">
                                {formatAmountK(totalAmount)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold block">
                                ₹{totalAmount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </td>

                          {/* 5. Max Age */}
                          <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                            {personBills.length === 0 ? (
                              <span className="text-xs text-slate-400 font-semibold">—</span>
                            ) : (
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black font-mono border shadow-2xs ${
                                  oldestAge >= 10
                                    ? 'bg-red-500/10 text-red-700 border-red-300 ring-1 ring-red-400/20 animate-pulse'
                                    : oldestAge >= 5
                                    ? 'bg-amber-500/10 text-amber-800 border-amber-300'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                <Clock className="w-3 h-3 shrink-0" />
                                <span>{oldestAge}d</span>
                              </span>
                            )}
                          </td>

                          {/* 6. Critical A-10 Count */}
                          <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                            {criticalCount > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-black shadow-xs shadow-red-500/20 animate-pulse">
                                <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                                <span>{criticalCount}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-xs font-bold font-mono">
                                0
                              </span>
                            )}
                          </td>

                          {/* 7. Action */}
                          <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleOpenHolderBills(user.id);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 group-hover:bg-sky-600 text-slate-700 group-hover:text-white rounded-xl border border-slate-200 group-hover:border-sky-600 font-black text-xs transition-all duration-150 shadow-2xs group-hover:shadow-md cursor-pointer whitespace-nowrap active:scale-95 touch-manipulation"
                            >
                              <span>View Bills</span>
                              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Compact Responsive List */}
            <div className="sm:hidden divide-y divide-slate-100 p-2 space-y-2">
              {sortedUserWorkload.map(
                (
                  { user, personBills, totalAmount, oldestAge, criticalCount },
                  index
                ) => {
                  return (
                    <div
                      key={user.id}
                      onClick={() => handleOpenHolderBills(user.id)}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-400 hover:bg-sky-50/50 shadow-xs transition cursor-pointer active:scale-[0.99] touch-manipulation space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`inline-flex items-center justify-center font-black text-xs px-2 py-0.5 rounded-lg border shadow-2xs font-mono shrink-0 ${
                              index === 0
                                ? 'bg-amber-500/15 text-amber-800 border-amber-400/50'
                                : index === 1
                                ? 'bg-slate-200/90 text-slate-800 border-slate-300'
                                : index === 2
                                ? 'bg-amber-700/10 text-amber-900 border-amber-600/30'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            #{index + 1}
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-black text-slate-900 text-sm uppercase truncate">
                              {user.full_name}
                            </h3>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">
                              {user.role}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenHolderBills(user.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-xl border border-sky-200 font-black text-xs shrink-0 cursor-pointer active:scale-95"
                        >
                          <span>View Bills</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-center pt-1 border-t border-slate-100">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block">
                            Bills
                          </span>
                          <span className="text-xs font-black text-slate-900 font-mono mt-0.5 block">
                            {personBills.length}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block">
                            Amount
                          </span>
                          <span className="text-xs font-black text-emerald-600 font-mono mt-0.5 block">
                            {formatAmountK(totalAmount)}
                          </span>
                        </div>

                        <div
                          className={`p-2 rounded-xl border ${
                            oldestAge >= 10
                              ? 'bg-red-50 text-red-700 border-red-200 font-black animate-pulse'
                              : oldestAge >= 5
                              ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                              : 'bg-slate-50 text-slate-700 border-slate-100'
                          }`}
                        >
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block">
                            Max Age
                          </span>
                          <span className="text-xs font-black font-mono mt-0.5 block">
                            {personBills.length === 0 ? '—' : `${oldestAge}d`}
                          </span>
                        </div>

                        <div
                          className={`p-2 rounded-xl border ${
                            criticalCount > 0
                              ? 'bg-red-500 text-white border-red-500 font-black animate-pulse'
                              : 'bg-slate-50 text-slate-400 border-slate-100'
                          }`}
                        >
                          <span
                            className={`text-[9px] font-extrabold uppercase block ${
                              criticalCount > 0 ? 'text-white/80' : 'text-slate-400'
                            }`}
                          >
                            A-10
                          </span>
                          <span className="text-xs font-black font-mono mt-0.5 block">
                            {criticalCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </>
        )}
      </Card3D>
    </div>
  );
};
