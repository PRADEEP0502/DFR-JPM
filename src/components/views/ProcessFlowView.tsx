import React from 'react';
import {
  Printer,
  Lightbulb,
  FileText,
  Users,
  Layers,
  ArrowRight,
  ArrowDown,
  Info,
  Check,
  FileSpreadsheet,
} from 'lucide-react';

/* ========================================================================= */
/* CUSTOM HIGH-QUALITY 3D-STYLE VECTOR ILLUSTRATIONS (EXACT TO REFERENCE)   */
/* ========================================================================= */

// 01. PRN: 3D Document with green plus button
const PrnIllustration: React.FC = () => (
  <svg viewBox="0 0 100 110" className="w-20 h-22 drop-shadow-md">
    <defs>
      <linearGradient id="prnDocBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f0f9ff" />
      </linearGradient>
      <linearGradient id="prnPlus" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <filter id="shadow1" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.12" />
      </filter>
    </defs>
    {/* Sheet shadow */}
    <rect x="18" y="10" width="64" height="82" rx="8" fill="#e0f2fe" />
    {/* Main Sheet */}
    <rect
      x="15"
      y="6"
      width="64"
      height="82"
      rx="8"
      fill="url(#prnDocBg)"
      stroke="#7dd3fc"
      strokeWidth="2"
      filter="url(#shadow1)"
    />
    {/* Fold corner */}
    <path d="M 63 6 L 79 22 L 63 22 Z" fill="#bae6fd" />
    <path d="M 63 6 L 79 22" stroke="#38bdf8" strokeWidth="1.5" />
    {/* Text Lines */}
    <rect x="23" y="18" width="32" height="4" rx="2" fill="#38bdf8" />
    <rect x="23" y="28" width="48" height="3" rx="1.5" fill="#93c5fd" />
    <rect x="23" y="36" width="44" height="3" rx="1.5" fill="#cbd5e1" />
    <rect x="23" y="44" width="48" height="3" rx="1.5" fill="#cbd5e1" />
    <rect x="23" y="52" width="38" height="3" rx="1.5" fill="#cbd5e1" />
    <rect x="23" y="60" width="42" height="3" rx="1.5" fill="#cbd5e1" />
    {/* Green Plus Badge */}
    <g transform="translate(56, 64)">
      <circle cx="16" cy="16" r="15" fill="url(#prnPlus)" stroke="#ffffff" strokeWidth="2.5" />
      <path
        d="M 16 9 L 16 23 M 9 16 L 23 16"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

// 02. QUOTATION: 3D Quotation Sheet with Rupee badge
const QuotationIllustration: React.FC = () => (
  <svg viewBox="0 0 100 110" className="w-20 h-22 drop-shadow-md">
    <defs>
      <linearGradient id="quoteBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f0fdf4" />
      </linearGradient>
      <linearGradient id="quoteBadge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    <rect x="18" y="10" width="64" height="82" rx="8" fill="#dcfce7" />
    <rect
      x="15"
      y="6"
      width="64"
      height="82"
      rx="8"
      fill="url(#quoteBg)"
      stroke="#86efac"
      strokeWidth="2"
    />
    {/* Quote Header Bar */}
    <rect x="22" y="14" width="50" height="12" rx="3" fill="#dcfce7" stroke="#86efac" strokeWidth="1" />
    <text x="47" y="23" textAnchor="middle" fontSize="7" fontWeight="900" fill="#047857" fontFamily="sans-serif">
      QUOTE
    </text>
    {/* Lines */}
    <rect x="22" y="32" width="48" height="3" rx="1.5" fill="#a7f3d0" />
    <rect x="22" y="40" width="42" height="3" rx="1.5" fill="#cbd5e1" />
    <rect x="22" y="48" width="48" height="3" rx="1.5" fill="#cbd5e1" />
    <rect x="22" y="56" width="36" height="3" rx="1.5" fill="#cbd5e1" />
    {/* Rupee Circle Badge */}
    <g transform="translate(56, 64)">
      <circle cx="16" cy="16" r="15" fill="url(#quoteBadge)" stroke="#ffffff" strokeWidth="2.5" />
      <text x="16" y="22" textAnchor="middle" fontSize="16" fontWeight="900" fill="#ffffff" fontFamily="sans-serif">
        ₹
      </text>
    </g>
  </svg>
);

// 03. PO: 3D Purchase Order with Shopping Cart
const PoIllustration: React.FC = () => (
  <svg viewBox="0 0 100 110" className="w-20 h-22 drop-shadow-md">
    <defs>
      <linearGradient id="poBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#fffbeb" />
      </linearGradient>
    </defs>
    <rect x="18" y="10" width="64" height="82" rx="8" fill="#fef3c7" />
    <rect
      x="15"
      y="6"
      width="64"
      height="82"
      rx="8"
      fill="url(#poBg)"
      stroke="#fcd34d"
      strokeWidth="2"
    />
    {/* PO header */}
    <rect x="23" y="16" width="28" height="4" rx="2" fill="#f59e0b" />
    <rect x="23" y="26" width="48" height="3" rx="1.5" fill="#cbd5e1" />
    {/* Shopping Cart Icon inside PO */}
    <g transform="translate(26, 36)">
      <path
        d="M 2 4 L 8 4 L 14 24 L 38 24 L 42 10 L 12 10"
        fill="none"
        stroke="#0284c7"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="30" r="3.5" fill="#0f172a" />
      <circle cx="35" cy="30" r="3.5" fill="#0f172a" />
      {/* Items in cart */}
      <rect x="15" y="12" width="6" height="7" rx="1" fill="#38bdf8" />
      <rect x="23" y="11" width="8" height="8" rx="1" fill="#f59e0b" />
      <rect x="33" y="13" width="6" height="6" rx="1" fill="#10b981" />
    </g>
    <rect x="23" y="74" width="48" height="3" rx="1.5" fill="#cbd5e1" />
  </svg>
);

// 04. MI: 3D Stacked Cardboard Delivery Boxes with Blue Checkmark
const MiIllustration: React.FC = () => (
  <svg viewBox="0 0 100 110" className="w-20 h-22 drop-shadow-md">
    <defs>
      <linearGradient id="box1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="boxTop" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <linearGradient id="miCheck" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
    </defs>
    {/* Big Back Box */}
    <g transform="translate(18, 28)">
      {/* Box Front */}
      <rect x="0" y="12" width="42" height="38" rx="3" fill="url(#box1)" />
      {/* Tape Front */}
      <rect x="17" y="12" width="8" height="38" fill="#fde68a" opacity="0.85" />
      {/* Box Top Flap */}
      <polygon points="0,12 12,0 54,0 42,12" fill="url(#boxTop)" />
      {/* Box Right Side */}
      <polygon points="42,12 54,0 54,38 42,50" fill="#92400e" />
      <polygon points="21,6 27,0 35,0 29,6" fill="#fef08a" opacity="0.8" />
    </g>
    {/* Small Front Box */}
    <g transform="translate(38, 48)">
      <rect x="0" y="8" width="32" height="28" rx="2" fill="#d97706" />
      <rect x="12" y="8" width="7" height="28" fill="#fde68a" opacity="0.85" />
      <polygon points="0,8 8,0 40,0 32,8" fill="#fbbf24" />
      <polygon points="32,8 40,0 40,28 32,36" fill="#78350f" />
    </g>
    {/* Blue Checkmark Badge */}
    <g transform="translate(56, 64)">
      <circle cx="16" cy="16" r="15" fill="url(#miCheck)" stroke="#ffffff" strokeWidth="2.5" />
      <path
        d="M 10 16 L 14 21 L 22 11"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

// 05. GRN: 3D Teal Checklist Clipboard with Checkmark
const GrnIllustration: React.FC = () => (
  <svg viewBox="0 0 100 110" className="w-20 h-22 drop-shadow-md">
    <defs>
      <linearGradient id="clipBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#0f766e" />
      </linearGradient>
      <linearGradient id="grnCheck" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    {/* Clipboard Base */}
    <rect x="15" y="8" width="64" height="82" rx="7" fill="url(#clipBg)" />
    {/* Top Metallic Clip */}
    <rect x="36" y="4" width="22" height="10" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
    <circle cx="47" cy="8" r="2" fill="#475569" />
    {/* White Paper */}
    <rect x="20" y="16" width="54" height="70" rx="4" fill="#ffffff" />
    {/* Checklist rows */}
    <g transform="translate(25, 24)">
      {/* Item 1 */}
      <circle cx="5" cy="5" r="3.5" fill="#14b8a6" />
      <path d="M 3.5 5 L 4.5 6.5 L 6.5 3.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="12" y="3.5" width="28" height="3" rx="1.5" fill="#0f766e" />
      {/* Item 2 */}
      <circle cx="5" cy="15" r="3.5" fill="#14b8a6" />
      <path d="M 3.5 15 L 4.5 16.5 L 6.5 13.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="12" y="13.5" width="24" height="3" rx="1.5" fill="#64748b" />
      {/* Item 3 */}
      <circle cx="5" cy="25" r="3.5" fill="#14b8a6" />
      <path d="M 3.5 25 L 4.5 26.5 L 6.5 23.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="12" y="23.5" width="20" height="3" rx="1.5" fill="#64748b" />
      {/* Item 4 */}
      <circle cx="5" cy="35" r="3.5" fill="#14b8a6" />
      <path d="M 3.5 35 L 4.5 36.5 L 6.5 33.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="12" y="33.5" width="26" height="3" rx="1.5" fill="#64748b" />
    </g>
    {/* Checkmark Badge */}
    <g transform="translate(56, 64)">
      <circle cx="16" cy="16" r="15" fill="url(#grnCheck)" stroke="#ffffff" strokeWidth="2.5" />
      <path
        d="M 10 16 L 14 21 L 22 11"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

// 06. BILL INWARD: 3D Invoice Document with Checkmark
const BillInwardIllustration: React.FC = () => (
  <svg viewBox="0 0 100 110" className="w-20 h-22 drop-shadow-md">
    <defs>
      <linearGradient id="invBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#fff1f2" />
      </linearGradient>
      <linearGradient id="billCheck" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    <rect x="18" y="10" width="64" height="82" rx="8" fill="#ffe4e6" />
    <rect
      x="15"
      y="6"
      width="64"
      height="82"
      rx="8"
      fill="url(#invBg)"
      stroke="#fda4af"
      strokeWidth="2"
    />
    {/* INVOICE Title Header */}
    <rect x="22" y="14" width="50" height="12" rx="3" fill="#ffe4e6" stroke="#fda4af" strokeWidth="1" />
    <text x="47" y="23" textAnchor="middle" fontSize="7" fontWeight="900" fill="#be123c" fontFamily="sans-serif">
      INVOICE
    </text>
    {/* Lines */}
    <rect x="22" y="32" width="48" height="3" rx="1.5" fill="#f43f5e" />
    <rect x="22" y="40" width="44" height="3" rx="1.5" fill="#cbd5e1" />
    <rect x="22" y="48" width="48" height="3" rx="1.5" fill="#cbd5e1" />
    <rect x="22" y="56" width="34" height="3" rx="1.5" fill="#cbd5e1" />
    {/* Checkmark Badge */}
    <g transform="translate(56, 64)">
      <circle cx="16" cy="16" r="15" fill="url(#billCheck)" stroke="#ffffff" strokeWidth="2.5" />
      <path
        d="M 10 16 L 14 21 L 22 11"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

// 07. BILL PASSING: 3D Stack of Cash Banknotes with Gold Rupee Coin
const BillPassingIllustration: React.FC = () => (
  <svg viewBox="0 0 100 110" className="w-20 h-22 drop-shadow-md">
    <defs>
      <linearGradient id="cashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="goldCoin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#eab308" />
      </linearGradient>
    </defs>
    {/* Bottom Cash Layer */}
    <g transform="translate(14, 46)">
      <rect x="0" y="8" width="56" height="24" rx="3" fill="#047857" stroke="#065f46" strokeWidth="1.5" />
      <rect x="20" y="8" width="16" height="24" fill="#fbbf24" opacity="0.9" />
    </g>
    {/* Middle Cash Layer */}
    <g transform="translate(16, 38)">
      <rect x="0" y="6" width="56" height="24" rx="3" fill="#059669" stroke="#047857" strokeWidth="1.5" />
      <rect x="20" y="6" width="16" height="24" fill="#fbbf24" opacity="0.9" />
    </g>
    {/* Top Cash Layer */}
    <g transform="translate(18, 30)">
      <rect x="0" y="4" width="56" height="24" rx="3" fill="url(#cashGrad)" stroke="#10b981" strokeWidth="1.5" />
      <circle cx="28" cy="16" r="6" fill="#047857" opacity="0.3" />
      <rect x="20" y="4" width="16" height="24" fill="#fde047" opacity="0.95" />
      <text x="28" y="19" textAnchor="middle" fontSize="9" fontWeight="900" fill="#064e3b" fontFamily="sans-serif">
        ₹
      </text>
    </g>
    {/* Gold Rupee Badge */}
    <g transform="translate(56, 62)">
      <circle cx="16" cy="16" r="15" fill="url(#goldCoin)" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="11" fill="none" stroke="#ca8a04" strokeWidth="1" strokeDasharray="2,2" />
      <text x="16" y="22" textAnchor="middle" fontSize="16" fontWeight="900" fill="#713f12" fontFamily="sans-serif">
        ₹
      </text>
    </g>
  </svg>
);

/* ========================================================================= */
/* 4 DETAILED 3D CHARACTER AVATARS FOR APPROVAL FLOW                         */
/* ========================================================================= */

// IAD: Auditor with Blue Suit & Laptop
const IadAvatar: React.FC = () => (
  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
    <div className="w-full h-full bg-sky-50 rounded-2xl flex flex-col items-center justify-end overflow-hidden relative">
      {/* Head */}
      <div className="w-8 h-8 rounded-full bg-amber-200 border border-amber-300 relative -mb-1 z-10">
        <div className="w-8 h-4 rounded-t-full bg-slate-800" />
      </div>
      {/* Body / Blue Suit */}
      <div className="w-14 h-7 bg-sky-600 rounded-t-xl flex items-center justify-center relative">
        <div className="w-3 h-5 bg-white -mt-2" />
        <div className="w-1.5 h-4 bg-sky-900 -mt-1" />
      </div>
      {/* Laptop badge */}
      <div className="absolute bottom-0 w-10 h-3 bg-slate-800 rounded-t-sm shadow-xs flex items-center justify-center">
        <div className="w-2 h-1 bg-sky-300 rounded-xs" />
      </div>
    </div>
  </div>
);

// AO: Officer with Glasses & Tie
const AoAvatar: React.FC = () => (
  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
    <div className="w-full h-full bg-emerald-50 rounded-2xl flex flex-col items-center justify-end overflow-hidden relative">
      {/* Head with Glasses */}
      <div className="w-8 h-8 rounded-full bg-amber-200 border border-amber-300 relative -mb-1 z-10 flex items-center justify-center">
        <div className="w-8 h-4 rounded-t-full bg-slate-800 absolute top-0" />
        {/* Glasses */}
        <div className="w-6 h-2 border-2 border-slate-800 rounded-full mt-2" />
      </div>
      {/* Body / Shirt + Tie */}
      <div className="w-14 h-7 bg-teal-600 rounded-t-xl flex items-center justify-center relative">
        <div className="w-3 h-5 bg-white -mt-2" />
        <div className="w-1.5 h-4 bg-emerald-900 -mt-1" />
      </div>
    </div>
  </div>
);

// JMD: Executive in Black Suit & Tie
const JmdAvatar: React.FC = () => (
  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
    <div className="w-full h-full bg-amber-50 rounded-2xl flex flex-col items-center justify-end overflow-hidden relative">
      {/* Head */}
      <div className="w-8 h-8 rounded-full bg-amber-200 border border-amber-300 relative -mb-1 z-10">
        <div className="w-8 h-4 rounded-t-full bg-slate-900" />
      </div>
      {/* Body / Executive Suit */}
      <div className="w-14 h-7 bg-slate-900 rounded-t-xl flex items-center justify-center relative">
        <div className="w-3.5 h-5 bg-white -mt-2" />
        <div className="w-1.5 h-4 bg-red-600 -mt-1" />
      </div>
    </div>
  </div>
);

// ACCOUNTS: Female Accounts Manager with Gold Coins
const AccountsAvatar: React.FC = () => (
  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-400 to-indigo-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
    <div className="w-full h-full bg-purple-50 rounded-2xl flex flex-col items-center justify-end overflow-hidden relative">
      {/* Head with Hair */}
      <div className="w-8 h-8 rounded-full bg-amber-200 border border-amber-300 relative -mb-1 z-10">
        <div className="w-9 h-5 rounded-t-full bg-slate-900 -ml-0.5" />
      </div>
      {/* Body / Purple Blazer */}
      <div className="w-14 h-7 bg-purple-700 rounded-t-xl flex items-center justify-center relative">
        <div className="w-3 h-5 bg-white -mt-2" />
      </div>
      {/* Coins badge */}
      <div className="absolute bottom-0 right-1 flex items-end -space-x-1">
        <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-600 shadow-xs" />
        <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 border border-yellow-600 shadow-xs" />
      </div>
    </div>
  </div>
);

/* ========================================================================= */
/* MAIN PROCESS FLOW VIEW COMPONENT                                          */
/* ========================================================================= */

export const ProcessFlowView: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 pb-16 max-w-full overflow-x-hidden text-slate-900 font-sans print:p-0 print:space-y-4">
      {/* ========================================================================= */}
      {/* HEADER SECTION: Title, Subtitle, Reference Badge, and Info Box            */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-5">
          {/* Title Area */}
          <div className="space-y-1.5 sm:space-y-2 max-w-2xl min-w-0">
            {/* Green Reference Tag */}
            <div className="flex items-center gap-2">
              <span className="w-5 sm:w-6 h-1 bg-emerald-500 rounded-full inline-block" />
              <span className="text-[10px] sm:text-[11px] font-black text-emerald-700 uppercase tracking-widest">
                PROCESS REFERENCE
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              JPM Purchase &amp; Bill Process Flow
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Complete purchase to payment process as per JPM.{' '}
              <span className="text-slate-500 font-normal">
                (For information only &ndash; Existing DFR workflow remains unchanged)
              </span>
            </p>
          </div>

          {/* Top Right: Cursive Slogan + Print Button + Green Info Card */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between lg:justify-end">
              <span className="italic text-slate-500 font-serif text-xs sm:text-sm tracking-wide hidden md:inline">
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
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 sm:p-3.5 flex items-start gap-3 shadow-2xs max-w-md w-full sm:w-auto">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <p className="text-[11px] sm:text-xs text-slate-700 font-semibold leading-snug">
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
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-xs">
        {/* Responsive Flow Grid: 1 col on mobile, 2 col on small tablet, 4 col on tablet/iPad, 7 col on laptop/desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 pt-3 sm:pt-4">
          {/* STEP 01: PRN */}
          <div className="relative group flex flex-col">
            <div className="bg-sky-50/40 hover:bg-sky-50/70 border border-sky-200/80 hover:border-sky-400 rounded-2xl p-3.5 sm:p-4 pt-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 h-full">
              {/* Number Badge at Top Center */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-500 text-white font-black text-xs flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-sky-100 font-mono">
                01
              </div>

              <h3 className="font-black text-sky-950 text-base tracking-tight mt-1">PRN</h3>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-tight">
                Purchase Request Note
              </p>

              {/* Graphic Illustration */}
              <div className="my-2 sm:my-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PrnIllustration />
              </div>

              {/* Action / Responsibility Badge */}
              <div className="w-full bg-white/95 border border-sky-100 text-slate-700 text-[11px] font-bold rounded-xl py-2 px-2 mt-auto shadow-2xs leading-snug">
                Raised by
                <br />
                <span className="text-slate-900 font-black">Reputed Department</span>
              </div>
            </div>

            {/* Desktop Connector Arrow (Laptop xl) */}
            <div className="hidden xl:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-sky-700 shadow-xs">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>

            {/* Mobile Downward Connector Arrow (Mobile only <640px) */}
            <div className="flex sm:hidden justify-center my-1 text-sky-400">
              <ArrowDown className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          {/* STEP 02: QUOTATION */}
          <div className="relative group flex flex-col">
            <div className="bg-emerald-50/40 hover:bg-emerald-50/70 border border-emerald-200/80 hover:border-emerald-400 rounded-2xl p-3.5 sm:p-4 pt-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-emerald-100 font-mono">
                02
              </div>

              <h3 className="font-black text-emerald-950 text-base tracking-tight mt-1">
                QUOTATION
              </h3>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-tight">
                Quotation Preparation &amp; Issue
              </p>

              <div className="my-2 sm:my-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                <QuotationIllustration />
              </div>

              <div className="w-full bg-white/95 border border-emerald-100 text-slate-700 text-[11px] font-bold rounded-xl py-2 px-2 mt-auto shadow-2xs leading-snug">
                Prepared &amp; Issued
                <br />
                <span className="text-emerald-800 font-extrabold text-[10px]">
                  (Approved by IAD &amp; AO)
                </span>
              </div>
            </div>

            <div className="hidden xl:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-emerald-700 shadow-xs">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>

            <div className="flex sm:hidden justify-center my-1 text-emerald-400">
              <ArrowDown className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          {/* STEP 03: PO */}
          <div className="relative group flex flex-col">
            <div className="bg-amber-50/40 hover:bg-amber-50/70 border border-amber-200/80 hover:border-amber-400 rounded-2xl p-3.5 sm:p-4 pt-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-amber-100 font-mono">
                03
              </div>

              <h3 className="font-black text-amber-950 text-base tracking-tight mt-1">PO</h3>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-tight">
                Purchase Order
              </p>

              <div className="my-2 sm:my-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PoIllustration />
              </div>

              <div className="w-full bg-white/95 border border-amber-100 text-slate-700 text-[11px] font-bold rounded-xl py-2 px-2 mt-auto shadow-2xs leading-snug">
                Prepared &amp; Issued
                <br />
                <span className="text-amber-800 font-extrabold text-[10px]">
                  (Approved by IAD &amp; AO)
                </span>
              </div>
            </div>

            <div className="hidden xl:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-amber-700 shadow-xs">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>

            <div className="flex sm:hidden justify-center my-1 text-amber-400">
              <ArrowDown className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          {/* STEP 04: MI */}
          <div className="relative group flex flex-col">
            <div className="bg-purple-50/40 hover:bg-purple-50/70 border border-purple-200/80 hover:border-purple-400 rounded-2xl p-3.5 sm:p-4 pt-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-500 text-white font-black text-xs flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-purple-100 font-mono">
                04
              </div>

              <h3 className="font-black text-purple-950 text-base tracking-tight mt-1">MI</h3>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-tight">
                Material Inward
              </p>

              <div className="my-2 sm:my-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MiIllustration />
              </div>

              <div className="w-full bg-white/95 border border-purple-100 text-slate-700 text-[11px] font-bold rounded-xl py-2 px-2 mt-auto shadow-2xs leading-snug">
                Material Inward
                <br />
                <span className="text-purple-950 font-black">at Stores</span>
              </div>
            </div>

            <div className="hidden xl:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-purple-700 shadow-xs">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>

            <div className="flex sm:hidden justify-center my-1 text-purple-400">
              <ArrowDown className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          {/* STEP 05: GRN */}
          <div className="relative group flex flex-col">
            <div className="bg-teal-50/40 hover:bg-teal-50/70 border border-teal-200/80 hover:border-teal-400 rounded-2xl p-3.5 sm:p-4 pt-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-500 text-white font-black text-xs flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-teal-100 font-mono">
                05
              </div>

              <h3 className="font-black text-teal-950 text-base tracking-tight mt-1">GRN</h3>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-tight">
                Goods Receipt Note
              </p>

              <div className="my-2 sm:my-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GrnIllustration />
              </div>

              <div className="w-full bg-white/95 border border-teal-100 text-slate-700 text-[11px] font-bold rounded-xl py-2 px-2 mt-auto shadow-2xs leading-snug">
                GRN Preparation
                <br />
                <span className="text-teal-950 font-black">&amp; Entry</span>
              </div>
            </div>

            <div className="hidden xl:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-teal-700 shadow-xs">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>

            <div className="flex sm:hidden justify-center my-1 text-teal-400">
              <ArrowDown className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          {/* STEP 06: BILL INWARD */}
          <div className="relative group flex flex-col">
            <div className="bg-rose-50/40 hover:bg-rose-50/70 border border-rose-200/80 hover:border-rose-400 rounded-2xl p-3.5 sm:p-4 pt-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-rose-100 font-mono">
                06
              </div>

              <h3 className="font-black text-rose-950 text-base tracking-tight mt-1">
                BILL INWARD
              </h3>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-tight">
                Bill Inward
              </p>

              <div className="my-2 sm:my-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BillInwardIllustration />
              </div>

              <div className="w-full bg-white/95 border border-rose-100 text-slate-700 text-[11px] font-bold rounded-xl py-2 px-2 mt-auto shadow-2xs leading-snug">
                Verified by
                <br />
                <span className="text-rose-950 font-black">IAD</span>
              </div>
            </div>

            <div className="hidden xl:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-rose-700 shadow-xs">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>

            <div className="flex sm:hidden justify-center my-1 text-rose-400">
              <ArrowDown className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          {/* STEP 07: BILL PASSING */}
          <div className="relative group flex flex-col">
            <div className="bg-amber-50/50 hover:bg-amber-50/80 border border-amber-300/90 hover:border-amber-500 rounded-2xl p-3.5 sm:p-4 pt-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-amber-200 font-mono">
                07
              </div>

              <h3 className="font-black text-amber-950 text-base tracking-tight mt-1">
                BILL PASSING
              </h3>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-tight">
                Final Approval &amp; Payment Processing
              </p>

              <div className="my-2 sm:my-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BillPassingIllustration />
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
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-xs space-y-5 sm:space-y-6">
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

        {/* 4 Cards Grid with Clean Arrow Connectors: 1 col on mobile, 2 col on tablet/iPad portrait, 4 col on laptop/desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: IAD */}
          <div className="relative group flex flex-col">
            <div className="bg-sky-50/40 hover:bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3.5 sm:p-5 flex items-center gap-3.5 sm:gap-4 shadow-2xs hover:shadow-xs transition h-full">
              <IadAvatar />
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-slate-900 text-base tracking-tight">IAD</h3>
                <p className="text-xs text-slate-500 font-bold leading-tight">Internal Audit Department</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-white text-sky-600 border border-sky-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>
            {/* Desktop / iPad Landscape Arrow */}
            <div className="hidden lg:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-teal-700 shadow-2xs">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            {/* Mobile Downward Connector */}
            <div className="flex sm:hidden justify-center my-0.5 text-sky-400">
              <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          {/* Card 2: AO */}
          <div className="relative group flex flex-col">
            <div className="bg-emerald-50/40 hover:bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-5 flex items-center gap-3.5 sm:gap-4 shadow-2xs hover:shadow-xs transition h-full">
              <AoAvatar />
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-slate-900 text-base tracking-tight">AO</h3>
                <p className="text-xs text-slate-500 font-bold leading-tight">Administrative Officer</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-white text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="hidden lg:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-teal-700 shadow-2xs">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="flex sm:hidden justify-center my-0.5 text-emerald-400">
              <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          {/* Card 3: JMD */}
          <div className="relative group flex flex-col">
            <div className="bg-amber-50/40 hover:bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 sm:p-5 flex items-center gap-3.5 sm:gap-4 shadow-2xs hover:shadow-xs transition h-full">
              <JmdAvatar />
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-slate-900 text-base tracking-tight">JMD</h3>
                <p className="text-xs text-slate-500 font-bold leading-tight">Junior Managing Director</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-white text-amber-600 border border-amber-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="hidden lg:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-teal-700 shadow-2xs">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="flex sm:hidden justify-center my-0.5 text-amber-400">
              <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          {/* Card 4: ACCOUNTS */}
          <div className="relative group flex flex-col">
            <div className="bg-purple-50/40 hover:bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3.5 sm:p-5 flex items-center gap-3.5 sm:gap-4 shadow-2xs hover:shadow-xs transition h-full">
              <AccountsAvatar />
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-slate-900 text-base tracking-tight">ACCOUNTS</h3>
                <p className="text-xs text-slate-500 font-bold leading-tight">Processing &amp; Payment</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-white text-purple-600 border border-purple-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: KEY POINTS & PROCESS AT A GLANCE                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Left Column: Key Points Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Info className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">Key Points</h2>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                All approvals are mandatory as per the process flow.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                This is the official JPM process for purchase and bill processing.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                Use this as a reference to understand the complete flow.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
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
              <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                For any process-related queries, contact the Purchase Department.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Process at a Glance Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Process at a Glance
            </h2>
          </div>

          {/* 4 Stat Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
            {/* Tile 1: 7 Main Stages */}
            <div className="bg-sky-50/50 border border-sky-200/80 rounded-2xl p-3 sm:p-3.5 text-center flex flex-col items-center justify-center shadow-2xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-1 shadow-2xs">
                <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">7</p>
              <p className="text-[10px] sm:text-[11px] font-black text-slate-800 uppercase tracking-tight mt-0.5">
                Main Stages
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-semibold mt-0.5">From PRN to Payment</p>
            </div>

            {/* Tile 2: 5 Key Departments */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 text-center flex flex-col items-center justify-center shadow-2xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center mb-1 shadow-2xs">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">5</p>
              <p className="text-[10px] sm:text-[11px] font-black text-slate-800 uppercase tracking-tight mt-0.5">
                Key Departments
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-semibold mt-0.5">In Bill Passing</p>
            </div>

            {/* Tile 3: 100% Approvals Mandatory */}
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-3 sm:p-3.5 text-center flex flex-col items-center justify-center shadow-2xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1 shadow-2xs">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 font-mono tracking-tight">100%</p>
              <p className="text-[10px] sm:text-[11px] font-black text-slate-800 uppercase tracking-tight mt-0.5">
                Approvals Mandatory
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-semibold mt-0.5">As per policy</p>
            </div>

            {/* Tile 4: One Goal */}
            <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-3 sm:p-3.5 text-center flex flex-col items-center justify-center shadow-2xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center mb-1 shadow-2xs font-black text-xs">
                ★
              </div>
              <p className="text-sm sm:text-base font-black text-amber-900 tracking-tight">
                One Goal
              </p>
              <p className="text-[10px] sm:text-[11px] font-black text-slate-800 uppercase tracking-tight mt-0.5">
                Accurate Processing
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-semibold mt-0.5">Timely Payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FOOTER NOTE / WATERMARK                                                   */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium pt-2 px-1 border-t border-slate-200/80 gap-2 text-center sm:text-left">
        <span>&copy; 2026 Junior Processing Mill (JPM). All rights reserved.</span>
        <span className="hidden sm:inline">DFR | Purchase &amp; Bill Process Flow | For Information Only</span>
        <div className="flex items-center gap-2">
          {/* Subtle Mountain Watermark Graphic */}
          <svg viewBox="0 0 60 24" className="w-12 h-6 text-sky-200 fill-current opacity-70">
            <polygon points="10,24 25,6 40,24" />
            <polygon points="30,24 45,10 58,24" />
          </svg>
          <span className="italic text-slate-500 font-serif">*Better Process Stronger Tomorrow*</span>
        </div>
      </div>
    </div>
  );
};
