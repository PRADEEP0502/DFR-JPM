import React from 'react';
import {
  Printer,
  Lightbulb,
  CheckCircle2,
  FileText,
  ShoppingCart,
  Package,
  ClipboardCheck,
  Receipt,
  IndianRupee,
  Users,
  Building2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Info,
  Check,
  Coins,
  FileSpreadsheet,
} from 'lucide-react';

export const ProcessFlowView: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 max-w-full overflow-hidden text-slate-900 font-sans print:p-0 print:space-y-4">
      {/* ========================================================================= */}
      {/* HEADER SECTION: Title, Subtitle, Reference Badge, and Info Box            */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          {/* Title Area */}
          <div className="space-y-2 max-w-2xl min-w-0">
            {/* Green Reference Tag */}
            <div className="flex items-center gap-2">
              <span className="w-5 h-1 bg-emerald-500 rounded-full inline-block" />
              <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">
                PROCESS REFERENCE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              JPM Purchase &amp; Bill Process Flow
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Complete purchase to payment process as per JPM.{' '}
              <span className="text-slate-500">
                (For information only &ndash; Existing DFR flow remains unchanged)
              </span>
            </p>
          </div>

          {/* Top Right: Cursive Quote + Print Button + Info Card */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between lg:justify-end">
              <span className="italic text-slate-500 font-serif text-xs sm:text-sm tracking-wide hidden sm:inline">
                From Request to Payment &ndash; Together for a Stronger JPM
              </span>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs shadow-2xs transition cursor-pointer print:hidden"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print</span>
              </button>
            </div>

            {/* Light Green Information Box */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs max-w-md">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Lightbulb className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-700 font-semibold leading-snug">
                This is a reference flow to help everyone understand the overall process at JPM. It does
                not change the existing DFR workflow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: MAIN PURCHASE & BILL PROCESS FLOW (01 TO 07)                   */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-sky-500 rounded-full inline-block" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Purchase to Payment Lifecycle (7 Stages)
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Sequential Flow
          </span>
        </div>

        {/* 7-Step Horizontal Flow Grid with connecting arrows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 pt-2">
          {/* STEP 01: PRN */}
          <div className="relative group">
            <div className="bg-sky-50/50 hover:bg-sky-50 border border-sky-200/80 hover:border-sky-400 rounded-2xl p-4 pt-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 h-full">
              {/* Number Badge at Top Center */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-sky-500 text-white font-black text-xs flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-sky-100 font-mono">
                01
              </div>

              <h3 className="font-black text-sky-950 text-base tracking-tight mt-1">PRN</h3>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-tight">
                Purchase Request Note
              </p>

              {/* Graphic Icon Container */}
              <div className="my-4 relative w-16 h-18 bg-white border-2 border-sky-300 rounded-xl p-2 shadow-xs flex flex-col justify-between group-hover:scale-105 transition-transform">
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-sky-200 rounded" />
                  <div className="w-3/4 h-1.5 bg-sky-100 rounded" />
                  <div className="w-1/2 h-1.5 bg-sky-100 rounded" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-xs border border-white">
                  +
                </div>
              </div>

              {/* Action / Responsibility Badge */}
              <div className="w-full bg-white/95 border border-sky-100 text-slate-700 text-[11px] font-bold rounded-xl py-2 px-2 mt-auto shadow-2xs leading-snug">
                Raised by
                <br />
                <span className="text-slate-900 font-black">Reputed Department</span>
              </div>
            </div>

            {/* Desktop Connector Arrow */}
            <div className="hidden xl:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 shadow-2xs">
              <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
            </div>
          </div>

          {/* STEP 02: QUOTATION */}
          <div className="relative group">
            <div className="bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200/80 hover:border-emerald-400 rounded-2xl p-4 pt-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-emerald-100 font-mono">
                02
              </div>

              <h3 className="font-black text-emerald-950 text-base tracking-tight mt-1">
                QUOTATION
              </h3>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-tight">
                Quotation Preparation &amp; Issue
              </p>

              <div className="my-4 relative w-16 h-18 bg-white border-2 border-emerald-400 rounded-xl p-2 shadow-xs flex flex-col justify-between group-hover:scale-105 transition-transform">
                <div className="w-full text-center text-[8px] font-black text-emerald-700 bg-emerald-50 rounded py-0.5 border border-emerald-200">
                  QUOTE
                </div>
                <div className="space-y-1">
                  <div className="w-full h-1 bg-emerald-100 rounded" />
                  <div className="w-2/3 h-1 bg-emerald-100 rounded" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs border border-white">
                  ₹
                </div>
              </div>

              <div className="w-full bg-white/95 border border-emerald-100 text-slate-700 text-[11px] font-bold rounded-xl py-2 px-2 mt-auto shadow-2xs leading-snug">
                Prepared &amp; Issued
                <br />
                <span className="text-emerald-800 font-extrabold text-[10px]">
                  (Approved by IAD &amp; AO)
                </span>
              </div>
            </div>

            <div className="hidden xl:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 shadow-2xs">
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          {/* STEP 03: PO */}
          <div className="relative group">
            <div className="bg-amber-50/50 hover:bg-amber-50 border border-amber-200/80 hover:border-amber-400 rounded-2xl p-4 pt-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-amber-100 font-mono">
                03
              </div>

              <h3 className="font-black text-amber-950 text-base tracking-tight mt-1">PO</h3>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-tight">
                Purchase Order
              </p>

              <div className="my-4 relative w-16 h-18 bg-white border-2 border-amber-300 rounded-xl p-2 shadow-xs flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingCart className="w-7 h-7 text-sky-600" />
                <div className="w-3/4 h-1 bg-amber-200 rounded mt-1.5" />
              </div>

              <div className="w-full bg-white/95 border border-amber-100 text-slate-700 text-[11px] font-bold rounded-xl py-2 px-2 mt-auto shadow-2xs leading-snug">
                Prepared &amp; Issued
                <br />
                <span className="text-amber-800 font-extrabold text-[10px]">
                  (Approved by IAD &amp; AO)
                </span>
              </div>
            </div>

            <div className="hidden xl:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 shadow-2xs">
              <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </div>

          {/* STEP 04: MI */}
          <div className="relative group">
            <div className="bg-purple-50/50 hover:bg-purple-50 border border-purple-200/80 hover:border-purple-400 rounded-2xl p-4 pt-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-purple-500 text-white font-black text-xs flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-purple-100 font-mono">
                04
              </div>

              <h3 className="font-black text-purple-950 text-base tracking-tight mt-1">MI</h3>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-tight">
                Material Inward
              </p>

              <div className="my-4 relative w-16 h-18 flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-amber-100/80 border-2 border-amber-300 rounded-xl flex items-center justify-center shadow-xs">
                  <Package className="w-7 h-7 text-amber-800" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black shadow-xs border border-white">
                  ✓
                </div>
              </div>

              <div className="w-full bg-white/95 border border-purple-100 text-slate-700 text-[11px] font-bold rounded-xl py-2 px-2 mt-auto shadow-2xs leading-snug">
                Material Inward
                <br />
                <span className="text-purple-950 font-black">at Stores</span>
              </div>
            </div>

            <div className="hidden xl:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 shadow-2xs">
              <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
            </div>
          </div>

          {/* STEP 05: GRN */}
          <div className="relative group">
            <div className="bg-teal-50/50 hover:bg-teal-50 border border-teal-200/80 hover:border-teal-400 rounded-2xl p-4 pt-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-teal-500 text-white font-black text-xs flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-teal-100 font-mono">
                05
              </div>

              <h3 className="font-black text-teal-950 text-base tracking-tight mt-1">GRN</h3>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-tight">
                Goods Receipt Note
              </p>

              <div className="my-4 relative w-16 h-18 bg-white border-2 border-teal-400 rounded-xl p-2 shadow-xs flex flex-col justify-between group-hover:scale-105 transition-transform">
                <div className="w-6 h-1.5 bg-teal-300 rounded-full mx-auto" />
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                    <div className="w-full h-1 bg-teal-100 rounded" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                    <div className="w-3/4 h-1 bg-teal-100 rounded" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                    <div className="w-2/3 h-1 bg-teal-100 rounded" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-xs border border-white">
                  ✓
                </div>
              </div>

              <div className="w-full bg-white/95 border border-teal-100 text-slate-700 text-[11px] font-bold rounded-xl py-2 px-2 mt-auto shadow-2xs leading-snug">
                GRN Preparation
                <br />
                <span className="text-teal-950 font-black">&amp; Entry</span>
              </div>
            </div>

            <div className="hidden xl:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 shadow-2xs">
              <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
            </div>
          </div>

          {/* STEP 06: BILL INWARD */}
          <div className="relative group">
            <div className="bg-rose-50/50 hover:bg-rose-50 border border-rose-200/80 hover:border-rose-400 rounded-2xl p-4 pt-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-rose-100 font-mono">
                06
              </div>

              <h3 className="font-black text-rose-950 text-base tracking-tight mt-1">
                BILL INWARD
              </h3>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-tight">
                Bill Inward Entry
              </p>

              <div className="my-4 relative w-16 h-18 bg-white border-2 border-rose-300 rounded-xl p-2 shadow-xs flex flex-col justify-between group-hover:scale-105 transition-transform">
                <div className="w-full text-center text-[8px] font-black text-rose-600 bg-rose-50 rounded py-0.5 border border-rose-200">
                  INVOICE
                </div>
                <div className="space-y-1">
                  <div className="w-full h-1 bg-rose-100 rounded" />
                  <div className="w-3/4 h-1 bg-rose-100 rounded" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-xs border border-white">
                  ✓
                </div>
              </div>

              <div className="w-full bg-white/95 border border-rose-100 text-slate-700 text-[11px] font-bold rounded-xl py-2 px-2 mt-auto shadow-2xs leading-snug">
                Verified by
                <br />
                <span className="text-rose-950 font-black">IAD</span>
              </div>
            </div>

            <div className="hidden xl:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 shadow-2xs">
              <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
            </div>
          </div>

          {/* STEP 07: BILL PASSING */}
          <div className="relative group">
            <div className="bg-amber-50/60 hover:bg-amber-50 border border-amber-300/90 hover:border-amber-500 rounded-2xl p-4 pt-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-amber-200 font-mono">
                07
              </div>

              <h3 className="font-black text-amber-950 text-base tracking-tight mt-1">
                BILL PASSING
              </h3>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-tight">
                Final Approval &amp; Payment
              </p>

              <div className="my-4 relative w-16 h-18 flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-14 h-10 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-lg shadow-xs border border-emerald-400 flex items-center justify-center">
                  <span className="text-white font-black text-[10px] font-mono tracking-wider">
                    ₹ CASH
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-xs border border-white">
                  ₹
                </div>
              </div>

              <div className="w-full bg-white/95 border border-amber-200 text-slate-700 text-[11px] font-bold rounded-xl py-2 px-2 mt-auto shadow-2xs leading-snug">
                <span className="text-slate-900 font-black">IAD → AO → JMD →</span>
                <br />
                <span className="text-emerald-700 font-black">Accounts → Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: BILL PASSING APPROVAL FLOW (IAD -> AO -> JMD -> ACCOUNTS)      */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full inline-block" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Bill Passing Approval Flow
            </h2>
          </div>
          <span className="italic text-slate-500 font-serif text-xs sm:text-sm tracking-wide">
            &ldquo;Every approval moves us forward&rdquo;
          </span>
        </div>

        {/* 4 Cards Grid with Clean Arrow Connectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: IAD */}
          <div className="relative group">
            <div className="bg-sky-50/40 hover:bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center text-lg font-black shrink-0 shadow-2xs">
                👨‍💻
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-slate-900 text-base tracking-tight">IAD</h3>
                <p className="text-xs text-slate-500 font-bold">Internal Audit Department</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-white text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="hidden lg:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 shadow-2xs">
              <ArrowRight className="w-3 h-3 text-sky-600" />
            </div>
          </div>

          {/* Card 2: AO */}
          <div className="relative group">
            <div className="bg-emerald-50/40 hover:bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center text-lg font-black shrink-0 shadow-2xs">
                👨‍💼
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-slate-900 text-base tracking-tight">AO</h3>
                <p className="text-xs text-slate-500 font-bold">Administrative Officer</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-white text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="hidden lg:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 shadow-2xs">
              <ArrowRight className="w-3 h-3 text-emerald-600" />
            </div>
          </div>

          {/* Card 3: JMD */}
          <div className="relative group">
            <div className="bg-amber-50/40 hover:bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center text-lg font-black shrink-0 shadow-2xs">
                👔
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-slate-900 text-base tracking-tight">JMD</h3>
                <p className="text-xs text-slate-500 font-bold">Junior Managing Director</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-white text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="hidden lg:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 shadow-2xs">
              <ArrowRight className="w-3 h-3 text-amber-600" />
            </div>
          </div>

          {/* Card 4: ACCOUNTS */}
          <div className="relative group">
            <div className="bg-purple-50/40 hover:bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center text-lg font-black shrink-0 shadow-2xs">
                👩‍💼
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-slate-900 text-base tracking-tight">ACCOUNTS</h3>
                <p className="text-xs text-slate-500 font-bold">Processing &amp; Payment</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-white text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 shadow-2xs">
                <Coins className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: KEY POINTS & PROCESS AT A GLANCE                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Left Column: Key Points Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <Info className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">Key Points</h2>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                All approvals are mandatory as per the process flow.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                This is the official JPM process for purchase and bill processing.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                Use this as a reference to understand the complete flow.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                Your current DFR workflow (
                <strong className="text-slate-900">
                  Bill Inward &rarr; IAD &rarr; AO &rarr; JMD &rarr; Accounts &rarr; Tally
                </strong>
                ) remains unchanged.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                For any process-related queries, contact the Purchase Department.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Process at a Glance Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Process at a Glance
            </h2>
          </div>

          {/* 4 Stat Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* Tile 1: 7 Main Stages */}
            <div className="bg-sky-50/60 border border-sky-200/80 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-1 shadow-2xs">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">7</p>
              <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight mt-0.5">
                Main Stages
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">From PRN to Payment</p>
            </div>

            {/* Tile 2: 5 Key Departments */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center mb-1 shadow-2xs">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">5</p>
              <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight mt-0.5">
                Key Departments
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">In Bill Passing</p>
            </div>

            {/* Tile 3: 100% Approvals Mandatory */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1 shadow-2xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-emerald-600 font-mono tracking-tight">100%</p>
              <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight mt-0.5">
                Approvals Mandatory
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">As per policy</p>
            </div>

            {/* Tile 4: One Goal */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-1 shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-base font-black text-amber-700 font-mono tracking-tight">
                One Goal
              </p>
              <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight mt-0.5">
                Accurate Processing
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Timely Payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FOOTER NOTE / WATERMARK                                                   */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium pt-2 px-1 border-t border-slate-200/80 gap-2">
        <span>&copy; 2026 Junior Processing Mill (JPM). All rights reserved.</span>
        <span className="hidden sm:inline">DFR | Purchase &amp; Bill Process Flow | For Information Only</span>
        <span className="italic text-slate-500 font-serif">*Better Process Stronger Tomorrow*</span>
      </div>
    </div>
  );
};
