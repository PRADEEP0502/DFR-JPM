import { DfrUser, DfrLabel, CategoryHolderMapping, StageHolderMapping, ErpBill, DfrBillTracking, HolderHistory, DfrAlert, ProcessStage } from '../types/dfr';
import { mapErpToDfrStage } from './selsoftApi';

export const MOCK_USERS: DfrUser[] = [
  { id: 'user-001', full_name: 'VANITHA', role: 'STAFF', active: true },
  { id: 'user-002', full_name: 'SURIYA', role: 'STAFF', active: true },
  { id: 'user-003', full_name: 'KIRUTHIKA', role: 'STAFF', active: true },
  { id: 'user-004', full_name: 'IAD', role: 'STAFF', active: true },
  { id: 'user-005', full_name: 'AO', role: 'MANAGER', active: true },
  { id: 'user-006', full_name: 'JMD', role: 'MD', active: true },
  { id: 'user-007', full_name: 'HEMALATHA', role: 'STAFF', active: true },
  { id: 'user-008', full_name: 'ACCOUNTS', role: 'ACCOUNTS', active: true },
  { id: 'user-009', full_name: 'MD', role: 'MD', active: true },
  { id: 'user-000', full_name: 'Unassigned', role: 'STAFF', active: true },
];

export const INITIAL_CATEGORY_MAPPINGS: CategoryHolderMapping[] = [
  { id: 'map-1', category: 'CHEMICAL', holder_id: 'user-001', holder_name: 'VANITHA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
  { id: 'map-2', category: 'DYES', holder_id: 'user-001', holder_name: 'VANITHA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
  { id: 'map-3', category: 'POLYBAG', holder_id: 'user-001', holder_name: 'VANITHA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
  { id: 'map-4', category: 'MAINTENANCE', holder_id: 'user-002', holder_name: 'SURIYA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
  { id: 'map-5', category: 'ELECTRICAL', holder_id: 'user-002', holder_name: 'SURIYA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
  { id: 'map-6', category: 'STATIONARY', holder_id: 'user-003', holder_name: 'KIRUTHIKA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
  { id: 'map-7', category: 'CLEANING PURPOSE', holder_id: 'user-003', holder_name: 'KIRUTHIKA', is_active: true, updated_at: '2026-08-27T00:00:00Z' },
];

export const INITIAL_STAGE_HOLDERS: StageHolderMapping[] = [
  { stage: 'IAD', stage_name: 'Internal Audit Department (IAD)', default_holder_id: 'user-004', default_holder_name: 'IAD', updated_at: '2026-08-27T00:00:00Z' },
  { stage: 'AO', stage_name: 'Admin Officer (AO)', default_holder_id: 'user-005', default_holder_name: 'AO', updated_at: '2026-08-27T00:00:00Z' },
  { stage: 'JMD', stage_name: 'Joint Managing Director (JMD)', default_holder_id: 'user-006', default_holder_name: 'JMD', updated_at: '2026-08-27T00:00:00Z' },
  { stage: 'ACCOUNTS', stage_name: 'Accounts / Tally Stage', default_holder_id: 'user-008', default_holder_name: 'ACCOUNTS', updated_at: '2026-08-27T00:00:00Z' },
  { stage: 'TALLY', stage_name: 'Accounts / Tally Stage', default_holder_id: 'user-008', default_holder_name: 'ACCOUNTS', updated_at: '2026-08-27T00:00:00Z' },
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
      ageDays = 10 + (i % 18); // 10-28 days: A-10 Critical
    }

    const brDateObj = new Date(now.getTime() - ageDays * 24 * 60 * 60 * 1000);
    const brDate = brDateObj.toISOString().split('T')[0];

    // Bill invoice date is 1-5 days before BR Date
    const billDateObj = new Date(brDateObj.getTime() - (1 + (i % 5)) * 24 * 60 * 60 * 1000);
    const billDate = billDateObj.toISOString().split('T')[0];

    // Bill amount
    const amount = Math.floor(((i * 18730) % 450000 + 15000) / 100) * 100;

    // Approval / Stage simulation
    let approvalStatus = 'PENDING';
    let nextApprover = 'IAD';
    let rejectedBy: string | undefined = undefined;
    let rejectionReason: string | undefined = undefined;
    let tallyStatus: string | undefined = 'WAITING';
    let billStatus = 'OPEN';
    let tallyExportedDate: string | undefined = undefined;

    if (i % 17 === 0) {
      approvalStatus = 'REJECTED';
      nextApprover = 'PURCHASE';
      rejectedBy = 'HEMALATHA';
      rejectionReason = 'Price mismatch against approved purchase quotation';
    } else if (i > 105) {
      // Some closed/paid bills for testing
      approvalStatus = 'APPROVED';
      nextApprover = 'COMPLETED';
      tallyStatus = 'POSTED';
      billStatus = 'PAID';
      tallyExportedDate = new Date(brDateObj.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString();
    } else if (i % 4 === 0) {
      approvalStatus = 'APPROVED';
      nextApprover = 'TALLY';
      tallyStatus = 'EXPORTED';
      tallyExportedDate = new Date(brDateObj.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    } else if (i % 3 === 0) {
      approvalStatus = 'IN_PROGRESS';
      nextApprover = 'ACCOUNTS';
    } else if (i % 5 === 0) {
      approvalStatus = 'IN_PROGRESS';
      nextApprover = 'JMD';
    } else if (i % 2 === 0) {
      approvalStatus = 'IN_PROGRESS';
      nextApprover = 'AO';
    } else {
      approvalStatus = 'PENDING';
      nextApprover = 'IAD';
    }

    bills.push({
      header_id: headerId,
      br_no: brNo,
      br_date: brDate,
      category,
      supplier,
      bill_no: billNo,
      bill_date: billDate,
      amount,
      approval_status: approvalStatus,
      next_approver: nextApprover,
      rejected_by: rejectedBy,
      rejection_reason: rejectionReason,
      tally_status: tallyStatus,
      bill_status: billStatus,
      tally_exported_date: tallyExportedDate,
      last_modified_datetime: new Date(brDateObj.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    });
  }

  cachedMockDataset = bills;
  return bills;
};

/**
 * Seeds initial DFR tracking state from Selsoft ERP records
 */
export const generateInitialData = () => {
  const erpBills = getMockSelsoftDataset();
  const staffUsers = MOCK_USERS.filter(u => u.id !== 'user-000' && u.id !== 'user-008');

  const dfrBills: DfrBillTracking[] = [];
  const holderHistory: HolderHistory[] = [];
  const alerts: DfrAlert[] = [];
  const billLabelsMap: Record<number, string[]> = {};

  let historyIdCounter = 1;
  let alertIdCounter = 1;

  erpBills.forEach((e, idx) => {
    // Assign initial holder from staff rotation (maintained exclusively by DFR)
    const assignedUser = staffUsers[idx % staffUsers.length];
    const stage = mapErpToDfrStage(e);

    const dfrBill: DfrBillTracking = {
      header_id: e.header_id,
      current_holder_id: assignedUser.id,
      current_stage: stage,
      dfr_status: e.bill_status === 'PAID' ? 'PAID' : stage === 'TALLY' ? 'TALLY_DONE' : 'OPEN',
      created_at: new Date(e.br_date).toISOString(),
      updated_at: e.last_modified_datetime,
    };
    dfrBills.push(dfrBill);

    // Initial intake history entry
    holderHistory.push({
      id: historyIdCounter++,
      header_id: e.header_id,
      from_holder_id: null,
      to_holder_id: assignedUser.id,
      from_stage: null,
      to_stage: stage,
      changed_by: assignedUser.id,
      note: 'Initial Bill Inward intake from Selsoft ERP',
      changed_at: new Date(e.br_date).toISOString(),
    });

    // Multi-labels tagging sample
    if (idx % 7 === 0) billLabelsMap[e.header_id] = ['lbl-1', 'lbl-5'];
    else if (idx % 11 === 0) billLabelsMap[e.header_id] = ['lbl-2'];
    else if (idx % 13 === 0) billLabelsMap[e.header_id] = ['lbl-3'];

    // Critical A-10 alerts
    const now = new Date('2026-08-27T12:00:00Z');
    const brDateObj = new Date(e.br_date);
    const ageDays = Math.floor((now.getTime() - brDateObj.getTime()) / (1000 * 60 * 60 * 24));

    if (ageDays >= 10 && e.bill_status !== 'PAID') {
      alerts.push({
        id: alertIdCounter++,
        header_id: e.header_id,
        band: 'A-10',
        raised_at: new Date(brDateObj.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        acknowledged_by: idx % 2 === 0 ? 'user-004' : undefined,
        acknowledged_at: idx % 2 === 0 ? new Date().toISOString() : undefined,
      });
    }
  });

  return {
    erpBills,
    dfrBills,
    holderHistory,
    alerts,
    billLabelsMap,
  };
};
