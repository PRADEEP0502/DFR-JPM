import { DfrUser, DfrLabel, CategoryHolderMapping, ErpBill, DfrBillTracking, HolderHistory, DfrAlert, ProcessStage } from '../types/dfr';
import { mapErpToDfrStage } from './selsoftApi';

import { DEFAULT_USERS } from './authService';

export const MOCK_USERS: DfrUser[] = DEFAULT_USERS;

export const INITIAL_CATEGORY_MAPPINGS: CategoryHolderMapping[] = [
  { id: 'map-1', category: 'CHEMICAL', holder_id: 'user-001', holder_name: 'VANITHA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
  { id: 'map-2', category: 'DYES', holder_id: 'user-001', holder_name: 'VANITHA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
  { id: 'map-3', category: 'POLYBAG', holder_id: 'user-001', holder_name: 'VANITHA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
  { id: 'map-4', category: 'MAINTENANCE', holder_id: 'user-002', holder_name: 'SURIYA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
  { id: 'map-5', category: 'ELECTRICAL', holder_id: 'user-002', holder_name: 'SURIYA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
  { id: 'map-6', category: 'STATIONARY', holder_id: 'user-003', holder_name: 'KIRUTHIKA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
  { id: 'map-7', category: 'CLEANING PURPOSE', holder_id: 'user-003', holder_name: 'KIRUTHIKA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
  { id: 'map-8', category: 'SERVICE', holder_id: 'user-002', holder_name: 'SURIYA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
  { id: 'map-9', category: 'SB', holder_id: 'user-002', holder_name: 'SURIYA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
];

export const INITIAL_LABELS: DfrLabel[] = [
  { id: 'lbl-1', name: 'High Priority', color: '#ef4444', description: 'Urgent management attention required' },
  { id: 'lbl-2', name: 'Price Discrepancy', color: '#f59e0b', description: 'Variance found between PO and Invoice' },
  { id: 'lbl-3', name: 'QC Issue', color: '#8b5cf6', description: 'Pending lab testing or quality approval' },
  { id: 'lbl-4', name: 'Credit Note Pending', color: '#ec4899', description: 'Awaiting supplier credit adjustment' },
  { id: 'lbl-5', name: 'Regular Yarn', color: '#0284c7', description: 'Standard production raw material' },
  { id: 'lbl-6', name: 'GST Review', color: '#10b981', description: 'Tax rate or E-way bill validation' },
];

// Cache for mock Selsoft ERP dataset
let cachedMockDataset: ErpBill[] | null = null;

const CATEGORIES = ['CHEMICAL', 'STATIONARY', 'MAINTENANCE', 'DYES', 'ELECTRICAL', 'YARN', 'PACKING', 'GENERAL'];

const SUPPLIERS = [
  'COIMBATORE SPINNERS',
  'KAVERI YARNS LTD',
  'SRI RAMA TEXTILES',
  'BALAJI COTTON TRADING',
  'POOMPUHAR STORES',
  'JAYAM TRADERS',
  'BHARANI DYEING PROCESS',
  'THIRUMALAI TEXTILES',
  'NEXUS CHEMICALS CORP',
  'GOMATHI COTTON MILLS',
  'TIRUPUR KNITTING SUPPLIES',
  'SURYA ELECTRICALS',
  'VELAN INDUSTRIAL SPARES',
  'ANNAPOORNA PACKAGING',
];

/**
 * Generates 116 realistic Selsoft GetBillsInward API records
 */
export const getMockSelsoftDataset = (): ErpBill[] => {
  if (cachedMockDataset) return cachedMockDataset;

  const now = new Date('2026-08-27T12:00:00Z');
  const bills: ErpBill[] = [];

  for (let i = 1; i <= 116; i++) {
    const headerId = 1000 + i;
    const brNo = `BR-2026-${(10000 + i).toString().slice(1)}`;
    const category = CATEGORIES[i % CATEGORIES.length];
    const supplier = SUPPLIERS[i % SUPPLIERS.length];
    const billNo = i % 3 === 0 ? `MEMO-${2000 + i}` : `INV/2026/${3000 + i}`;

    // Age distribution across 0 - 28 days for realistic A-3, A-5, A-10 spread
    let ageDays = 0;
    if (i <= 40) {
      ageDays = (i % 3); // 0-2 days: NORMAL
    } else if (i <= 65) {
      ageDays = 3 + (i % 2); // 3-4 days: A-3
    } else if (i <= 90) {
      ageDays = 5 + (i % 5); // 5-9 days: A-5
    } else {
      ageDays = 10 + (i % 18); // 10+ days: A-10 Critical
    }

    const brDate = new Date(now.getTime() - ageDays * 24 * 60 * 60 * 1000);
    const brDateStr = brDate.toISOString().split('T')[0];

    const billDate = new Date(brDate.getTime() - (i % 4) * 24 * 60 * 60 * 1000);
    const billDateStr = billDate.toISOString().split('T')[0];

    const amount = Math.floor((15000 + (i * 3750) % 250000) / 100) * 100 + (i % 99);

    // Varied workflow approval statuses
    let approvalStatus = 'Preparation Pending';
    let nextApprover = 'Inward Desk';
    let tallyStatus = 'Waiting to Export';
    let billStatus = 'OPEN';
    let rejectedBy = '';
    let rejectionReason = '';

    if (i % 11 === 0) {
      approvalStatus = 'Rejected';
      rejectedBy = 'AUDIT TEAM';
      rejectionReason = 'Supporting GRN document missing';
      nextApprover = 'Re-submission Required';
    } else if (i % 5 === 0) {
      approvalStatus = 'Approved';
      nextApprover = 'Accounts';
      tallyStatus = 'Exported';
      billStatus = 'OPEN';
    } else if (i % 4 === 0) {
      approvalStatus = 'Waiting for Approval';
      nextApprover = 'JMD';
    } else if (i % 3 === 0) {
      approvalStatus = 'Waiting for Approval';
      nextApprover = 'AO';
    } else if (i % 2 === 0) {
      approvalStatus = 'Waiting for Approval';
      nextApprover = 'IAD';
    }

    bills.push({
      header_id: headerId,
      br_no: brNo,
      br_date: brDateStr,
      category,
      supplier,
      bill_no: billNo,
      bill_date: billDateStr,
      amount,
      approval_status: approvalStatus,
      next_approver: nextApprover,
      rejected_by: rejectedBy,
      rejection_reason: rejectionReason,
      tally_status: tallyStatus,
      bill_status: billStatus,
      last_modified_datetime: brDateStr,
      raw_payload: {
        HeaderId: headerId,
        BRNo: brNo,
        BRDate: brDateStr,
        Category: category,
        Supplier: supplier,
        BillNo: billNo,
        BillDate: billDateStr,
        Amount: amount,
        ApprovalStatus: approvalStatus,
        NextApprover: nextApprover,
        TallyStatus: tallyStatus,
      },
    });
  }

  cachedMockDataset = bills;
  return bills;
};
