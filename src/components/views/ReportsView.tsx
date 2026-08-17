import React, { useState } from 'react';
import { FileText, Download, Filter, CheckCircle2, Table } from 'lucide-react';
import { BillRegisterItem, DfrUser } from '../../types/dfr';

interface ReportsViewProps {
  bills: BillRegisterItem[];
  users: DfrUser[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ bills, users }) => {
  const [reportType, setReportType] = useState<'ALL' | 'PENDING' | 'CRITICAL' | 'TALLY' | 'PAID'>('ALL');

  const getFilteredData = () => {
    switch (reportType) {
      case 'PENDING':
        return bills.filter(b => b.dfr_status !== 'PAID' && b.dfr_status !== 'CLOSED');
      case 'CRITICAL':
        return bills.filter(b => b.age_band === 'A-10');
      case 'TALLY':
        return bills.filter(b => b.moved_to_tally && b.payment_status !== 'COMPLETED');
      case 'PAID':
        return bills.filter(b => b.dfr_status === 'PAID');
      default:
        return bills;
    }
  };

  const data = getFilteredData();

  const handleDownloadCsv = () => {
    const headers = [
      'GB No',
      'ERP Ref',
      'Bill/DC No',
      'Party Name',
      'Amount',
      'Category',
      'Owner (RP)',
      'Current Holder',
      'Stage',
      'DFR Status',
      'Effective Recd Date',
      'Overall Age (Days)',
      'Age Band',
      'Tally Posted At',
      'Tally Ageing (Days)',
      'Payment Status',
      'Multi-Labels'
    ];

    const rows = data.map(b => [
      b.gb_no,
      `"${b.erp_bill_ref}"`,
      `"${b.bill_dc_no}"`,
      `"${b.party_name.replace(/"/g, '""')}"`,
      b.amount,
      b.category,
      `"${b.owner_name}"`,
      `"${b.current_holder_name}"`,
      b.current_stage,
      b.dfr_status,
      b.effective_recd_date,
      b.age_days,
      b.age_band,
      b.tally_posted_at ? `"${new Date(b.tally_posted_at).toLocaleDateString()}"` : '',
      b.tally_age_days ?? '',
      b.payment_status,
      `"${b.labels.map(l => l.name).join(', ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `DFR_Register_Export_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" />
            Audit Reports & CSV Data Export
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Export bill registers, age summaries, and holder metrics for offline spreadsheet analysis
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Report to CSV ({data.length} records)
        </button>
      </div>

      {/* Preset Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Report Scope</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: 'ALL', label: 'Complete Register', desc: 'All 108+ bills' },
            { id: 'PENDING', label: 'Active Pending', desc: 'Excludes paid' },
            { id: 'CRITICAL', label: 'Critical (A-10)', desc: 'Overdue ≥10 days' },
            { id: 'TALLY', label: 'Tally Unpaid', desc: 'Awaiting payment' },
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
        <div className="p-4 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold bg-slate-50">
          <span>Export Data Preview ({data.length} rows)</span>
          <span>CSV Format: UTF-8 standard</span>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">GB No</th>
                <th className="py-3 px-4">Supplier Party</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Current Holder</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Age (Band)</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {data.slice(0, 10).map(b => (
                <tr key={b.gb_no} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-extrabold text-sky-600">GB #{b.gb_no}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{b.party_name}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">₹{b.amount.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-4 text-slate-500">{b.owner_name}</td>
                  <td className="py-2.5 px-4 text-sky-700 font-bold">{b.current_holder_name}</td>
                  <td className="py-2.5 px-4 text-slate-700">{b.current_stage}</td>
                  <td className="py-2.5 px-4 text-amber-700 font-bold">{b.age_days}d ({b.age_band})</td>
                  <td className="py-2.5 px-4 text-slate-700 font-semibold">{b.dfr_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
