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

export type BillCategory = 'CASH BILL' | 'CREDIT BILL';
export type ProcessStage = 'IAD' | 'AO' | 'PURCHASE' | 'JMD' | 'ACCOUNTS' | 'TALLY' | 'PAYMENT';
export type DfrStatus = 'OPEN' | 'ON_HOLD' | 'TALLY_DONE' | 'PAID' | 'CLOSED';
export type PaymentStatus = 'NOT_STARTED' | 'PENDING' | 'COMPLETED';
export type AgeBand = 'NORMAL' | 'A-3' | 'A-5' | 'A-10';

export interface ErpBill {
  erp_bill_ref: string;
  bill_dc_no: string;
  bill_date: string; // ISO YYYY-MM-DD
  party_name: string;
  amount: number;
  category: BillCategory;
  prn?: string;
  quotation_ref?: string;
  po_ref?: string;
  material_inward_ref?: string;
  qc_approval_status?: string;
  bill_inward_ref?: string;
  grn_ref?: string;
  bill_recd_date?: string; // ISO YYYY-MM-DD
  process_stage_raw?: string;
  tally_ref?: string;
  tally_posted_at?: string; // ISO date string
  payment_ref?: string;
  payment_status: PaymentStatus;
  payment_completed_at?: string;
  last_synced_at: string;
  raw_payload?: Record<string, any>;
}

export interface DfrBill {
  gb_no: number;
  erp_bill_ref: string;
  owner_id: string;
  current_holder_id: string;
  current_stage: ProcessStage;
  dfr_status: DfrStatus;
  created_at: string;
  updated_at: string;
}

export interface HolderHistory {
  id: number;
  gb_no: number;
  from_holder_id: string | null;
  to_holder_id: string;
  from_stage: ProcessStage | null;
  to_stage: ProcessStage;
  changed_by: string;
  note: string;
  changed_at: string;
}

export interface DfrAlert {
  id: number;
  gb_no: number;
  band: 'A-3' | 'A-5' | 'A-10';
  raised_at: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
}

export interface BillRegisterItem {
  gb_no: number;
  erp_bill_ref: string;
  bill_dc_no: string;
  bill_date: string;
  party_name: string;
  amount: number;
  category: BillCategory;
  owner_id: string;
  owner_name: string;
  current_holder_id: string;
  current_holder_name: string;
  current_stage: ProcessStage;
  dfr_status: DfrStatus;
  effective_recd_date: string;
  age_days: number;
  age_band: AgeBand;
  tally_posted_at?: string;
  tally_age_days?: number; // Days pending in Tally awaiting payment
  moved_to_tally: boolean;
  payment_status: PaymentStatus;
  payment_completed_at?: string;
  labels: DfrLabel[];
}

export interface SyncState {
  last_synced_at: string;
  is_syncing: boolean;
  total_bills: number;
  sync_errors_count: number;
  last_error?: string;
}
