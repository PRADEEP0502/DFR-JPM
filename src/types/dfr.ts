export type UserRole = 'MD' | 'MANAGER' | 'STAFF' | 'ACCOUNTS';

export interface DfrUser {
  id: string;
  full_name: string;
  role: UserRole;
  active: boolean;
}

export interface DfrLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface CategoryHolderMapping {
  id: string;
  category: string;
  holder_id: string;
  holder_name: string;
  is_active: boolean;
  updated_at: string;
}

export interface StageHolderMapping {
  stage: ProcessStage;
  stage_name: string;
  default_holder_id: string;
  default_holder_name: string;
  updated_at: string;
}

// Canonical DFR process stages: Bill Inward → IAD → AO → JMD → Accounts / Tally
export type ProcessStage = 'BILL_INWARD' | 'IAD' | 'AO' | 'JMD' | 'ACCOUNTS' | 'TALLY';

export const STAGE_DISPLAY_NAMES: Record<ProcessStage, string> = {
  BILL_INWARD: 'Bill Inward',
  IAD: 'IAD',
  AO: 'AO',
  JMD: 'JMD',
  ACCOUNTS: 'Accounts / Tally',
  TALLY: 'Accounts / Tally',
};

export type DfrStatus = 'OPEN' | 'ON_HOLD' | 'TALLY_DONE' | 'PAID' | 'CLOSED';
export type AgeBand = 'NORMAL' | 'A-3' | 'A-5' | 'A-10';

// 1. ERP Bill interface matching Selsoft GetBillsInward response
export interface ErpBill {
  header_id: number;
  br_no: string;
  br_date: string; // ISO YYYY-MM-DD - Bill Inward Date
  category: string; // e.g. CHEMICAL, STATIONARY, MAINTENANCE, DYES, ELECTRICAL
  supplier: string; // Party / Vendor Name
  bill_no: string; // Supplier Invoice/DC No
  bill_date: string; // Invoice Date
  amount: number;
  approval_status: string; // e.g. PENDING, APPROVED, REJECTED
  next_approver?: string;
  rejected_by?: string;
  rejection_reason?: string;
  tally_status?: string; // WAITING, EXPORTED, POSTED, PENDING
  bill_status: string; // OPEN, PAID, CLOSED, CANCELLED
  tally_exported_date?: string;
  last_modified_datetime: string;
  raw_payload?: Record<string, any>;
}

// 2. DFR Internal Tracking Record (Separated from ERP data)
export interface DfrBillTracking {
  header_id: number;
  current_holder_id: string; // Maintained strictly via DFR human checkpoints or ERP stage transitions
  current_stage: ProcessStage;
  dfr_status: DfrStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 3. Holder History Audit Log
export interface HolderHistory {
  id: number;
  header_id: number;
  from_holder_id: string | null;
  to_holder_id: string;
  from_stage: ProcessStage | null;
  to_stage: ProcessStage;
  changed_by: string;
  note: string;
  changed_at: string;
  source?: 'ERP Sync' | 'Manual Handover' | 'System Initial';
}

// 4. Ageing Alerts Log
export interface DfrAlert {
  id: number;
  header_id: number;
  band: 'A-3' | 'A-5' | 'A-10';
  raised_at: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
}

// 5. Unified Bill Register Item for Grid & Views
export interface BillRegisterItem {
  header_id: number;
  br_no: string;
  br_date: string;
  bill_no: string;
  bill_date: string;
  supplier: string;
  amount: number;
  category: string;
  current_holder_id: string;
  current_holder_name: string;
  current_stage: ProcessStage;
  age_days: number; // Strictly computed: Current Date - br_date
  age_band: AgeBand;
  approval_status: string;
  next_approver?: string;
  rejected_by?: string;
  rejection_reason?: string;
  tally_status?: string;
  tally_exported_date?: string;
  bill_status: string;
  dfr_status: DfrStatus;
  labels: DfrLabel[];
}

// 6. Selsoft API Metadata & Pagination Envelopes
export interface SelsoftApiResponse<T = ErpBill[]> {
  Success: boolean;
  PageNumber: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
  SyncTimestampUtc: string;
  Data: T;
  ErrorMessage?: string;
}

export interface SyncState {
  last_synced_at?: string | null;
  next_sync_at: string;
  sync_interval_mins: number;
  is_syncing: boolean;
  total_count: number;
  total_pages: number;
  sync_errors_count: number;
  last_error?: string;
}
