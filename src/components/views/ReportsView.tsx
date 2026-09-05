import React, { useState } from 'react';
import { FileText, Download, Filter, CheckCircle2, Table } from 'lucide-react';
import { BillRegisterItem, DfrUser, STAGE_DISPLAY_NAMES } from '../../types/dfr';

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

interface ReportsViewProps {
  bills: BillRegisterItem[];
  users: DfrUser[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ bills }) => {
  const [reportType, setReportType] = useState<'ALL' | 'PENDING' | 'CRITICAL' | 'TALLY' | 'PAID'>(
    'ALL'
  );

  const getFilteredData = () => {
    switch (reportType) {
      case 'PENDING':
        return bills.filter(
          b => b.bill_status !== 'PAID' && b.bill_status !== 'CLOSED' && b.dfr_status !== 'PAID'
        );
      case 'CRITICAL':
        return bills.filter(
          b =>
            b.age_band === 'A-10' &&
            b.bill_status !== 'PAID' &&
            b.bill_status !== 'CLOSED' &&
            b.dfr_status !== 'PAID'
        );
      case 'TALLY':
        return bills.filter(
          b =>
            b.tally_status !== 'EXPORTED' &&
            b.tally_status !== 'POSTED' &&
            b.bill_status !== 'PAID' &&
            b.bill_status !== 'CLOSED'
        );
      case 'PAID':
        return bills.filter(b => b.bill_status === 'PAID' || b.dfr_status === 'PAID');
      default:
        return bills;
    }
  };

  const data = getFilteredData();

  const handleDownloadCsv = () => {
    const headers = [
      'Header ID',
      'BR No',
      'BR Date',
      'Bill No',
      'Bill Date',
      'Supplier Party',
      'Category',
      'Amount',
      'Current Holder',
      'Current Stage',
      'Age (Days from BR Date)',
      'Ageing Band',
      'Approval Status',
      'Next Approver',
      'Tally Status',
      'Tally Exported Date',
      'Bill Status',
      'Rejected By',
      'Rejection Reason',
      'Multi-Labels',
    ];

    const rows = data.map(b => [
      b.header_id,
      `"${b.br_no}"`,
      `"${formatDateOnly(b.br_date)}"`,
      `"${b.bill_no}"`,
      `"${formatDateOnly(b.bill_date)}"`,
      `"${b.supplier.replace(/"/g, '""')}"`,
      `"${b.category}"`,
      b.amount,
      `"${b.current_holder_name}"`,
      `"${STAGE_DISPLAY_NAMES[b.current_stage] || b.current_stage}"`,
      b.age_days,
      b.age_band,
      `"${b.approval_status}"`,
      `"${b.next_approver || ''}"`,
      `"${b.tally_status || ''}"`,
      b.tally_exported_date ? `"${formatDateOnly(b.tally_exported_date)}"` : '',
      `"${b.bill_status}"`,
      `"${b.rejected_by || ''}"`,
      `"${b.rejection_reason || ''}"`,
      `"${b.labels.map(l => l.name).join(', ')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `DFR_JPM_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />
            Audit Reports & CSV Data Export
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Export complete bill registers, BR Date age summaries, and holder metrics for offline spreadsheet analysis
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
        >
          <Download className="w-4 h-4" />
          Export Report to CSV ({data.length} records)
        </button>
      </div>

      {/* Preset Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 text-slate-900">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Select Report Scope
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {[
            { id: 'ALL', label: 'Complete Register', desc: 'All 157+ bills' },
            { id: 'PENDING', label: 'Active Pending', desc: 'Excludes paid' },
            { id: 'CRITICAL', label: 'Critical (A-10)', desc: 'Overdue ≥10 days' },
            { id: 'TALLY', label: 'Awaiting Tally', desc: 'Pending export' },
            { id: 'PAID', label: 'Completed Paid', desc: 'Historical archive' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setReportType(p.id as any)}
              className={`p-3 rounded-xl border text-left transition ${
                reportType === p.id
                  ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-2xs font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <p className="font-bold text-xs text-slate-900">{p.label}</p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500 font-semibold bg-slate-50">
          <span>Export Data Preview ({data.length} rows)</span>
          <span>CSV Format: UTF-8 standard</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Header ID</th>
                <th className="py-3 px-4">BR No</th>
                <th className="py-3 px-4">Supplier Party</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Current Holder</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Age (BR Date)</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {data.slice(0, 10).map(b => (
                <tr key={b.header_id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-500">#{b.header_id}</td>
                  <td className="py-2.5 px-4 font-extrabold text-sky-600">{b.br_no}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{b.supplier}</td>
                  <td className="py-2.5 px-4">{b.category}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    ₹{b.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-4 text-sky-700 font-bold">{b.current_holder_name}</td>
                  <td className="py-2.5 px-4 text-slate-700">
                    {STAGE_DISPLAY_NAMES[b.current_stage] || b.current_stage}
                  </td>
                  <td className="py-2.5 px-4 text-amber-700 font-bold">
                    {b.age_days}d ({b.age_band})
                  </td>
                  <td className="py-2.5 px-4 text-slate-700 font-semibold">{b.bill_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
