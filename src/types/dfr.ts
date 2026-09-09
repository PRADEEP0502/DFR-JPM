export type UserRole = 'ADMIN' | 'MD' | 'MANAGER' | 'STAFF' | 'ACCOUNTS';

export type UserDepartment =
  | 'PURCHASE'
  | 'IAD'
  | 'AO'
  | 'GM'
  | 'JMD'
  | 'MD'
  | 'ACCOUNTS'
  | 'TALLY'
  | 'SYSTEM ADMIN';

export type AccessLevel = 'DEPARTMENT_ACCESS' | 'FULL_EDIT' | 'FULL_ACCESS';

export interface DfrUser {
  id: string;
  username: string;
  full_name: string;
  department: UserDepartment;
  role: UserRole;
  access_level: AccessLevel;
  active: boolean;
  last_login_at?: string;
  created_at?: string;
}

export interface AuthSession {
  token: string;
  user: DfrUser;
  created_at: string;
  expires_at: string;
}

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'HANDOVER'
  | 'MOVE_TO_TALLY'
  | 'PAYMENT_COMPLETE'
  | 'STAGE_CHANGE'
  | 'LABEL_CHANGE'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DISABLE'
  | 'PASSWORD_RESET'
  | 'CATEGORY_MAP_CREATE'
  | 'CATEGORY_MAP_UPDATE'
  | 'CATEGORY_MAP_DELETE'
  | 'ERP_SYNC'
  | 'MANUAL_SYNC'
  | 'ALERT_ACKNOWLEDGE'
  | 'SETTINGS_UPDATE';

export interface AuditLogEntry {
  id: number;
  user_id: string;
  user_name: string;
  user_role: string;
  action: AuditAction;
  details: string;
  header_id?: number;
  previous_value?: string;
  new_value?: string;
  timestamp: string;
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
  BILL_INWARD: 'BILL INWARD',
  IAD: 'IAD',
  AO: 'AO',
  JMD: 'JMD',
  ACCOUNTS: 'ACCOUNTS / TALLY',
  TALLY: 'ACCOUNTS / TALLY',
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

/**
 * Checks if a bill is fully completed/exported to Tally, paid, or closed.
 * Exported bills are excluded from active master bill register and current holder workload.
 */
export const isTallyExported = (b: BillRegisterItem): boolean => {
  const tally = (b.tally_status || '').toUpperCase().trim();
  const dfr = (b.dfr_status || '').toUpperCase().trim();
  const bill = (b.bill_status || '').toUpperCase().trim();

  if (
    tally.includes('WAITING') ||
    tally.includes('PENDING') ||
    tally === 'OPEN' ||
    tally === 'IN PROGRESS'
  ) {
    return false;
  }

  return (
    tally === 'EXPORTED' ||
    tally === 'POSTED' ||
    dfr === 'TALLY_DONE' ||
    dfr === 'PAID' ||
    bill === 'PAID' ||
    bill === 'CLOSED' ||
    Boolean(b.tally_exported_date)
  );
};

/**
 * Checks if an active (non-exported) bill is currently held by a specific user/role.
 */
export const isBillHeldByUser = (b: BillRegisterItem, user: DfrUser): boolean => {
  if (isTallyExported(b)) return false;

  const isIad =
    user.username?.toLowerCase() === 'iad' ||
    user.full_name?.toUpperCase() === 'IAD' ||
    user.id === 'user-004';
  const isAo =
    user.username?.toLowerCase() === 'ao' ||
    user.full_name?.toUpperCase() === 'AO' ||
    user.id === 'user-005';
  const isJmd =
    user.username?.toLowerCase() === 'jmd' ||
    user.full_name?.toUpperCase() === 'JMD' ||
    user.id === 'user-007';
  const isAccounts =
    user.username?.toLowerCase() === 'accounts' ||
    user.full_name?.toUpperCase() === 'ACCOUNTS' ||
    user.department === 'ACCOUNTS' ||
    user.id === 'user-011' ||
    user.id === 'user-accounts';

  if (isIad) {
    return (
      b.current_stage === 'IAD' ||
      b.current_holder_name?.toUpperCase().trim() === 'IAD' ||
      b.current_holder_id === user.id ||
      b.current_holder_id === 'user-004'
    );
  }

  if (isAo) {
    return (
      b.current_stage === 'AO' ||
      b.current_holder_name?.toUpperCase().trim() === 'AO' ||
      b.current_holder_id === user.id ||
      b.current_holder_id === 'user-005'
    );
  }

  if (isJmd) {
    return (
      b.current_stage === 'JMD' ||
      b.current_holder_name?.toUpperCase().trim() === 'JMD' ||
      b.current_holder_id === user.id ||
      b.current_holder_id === 'user-007'
    );
  }

  if (isAccounts) {
    return (
      b.current_stage === 'ACCOUNTS' ||
      b.current_stage === 'TALLY' ||
      b.current_holder_name?.toUpperCase().trim() === 'ACCOUNTS' ||
      b.current_holder_id === user.id ||
      b.current_holder_id === 'user-011' ||
      b.current_holder_id === 'user-accounts'
    );
  }

  // Staff / Purchase Inward custodians (e.g. VANITHA, JAYASURIYA, KRITHIKA)
  const matchesId = b.current_holder_id === user.id;
  const matchesName = Boolean(
    b.current_holder_name &&
      (b.current_holder_name.trim().toUpperCase() === user.full_name.trim().toUpperCase() ||
        b.current_holder_name.trim().toUpperCase() === user.username?.trim().toUpperCase())
  );

  return (
    (matchesId || matchesName) &&
    (b.current_stage === 'BILL_INWARD' ||
      !['IAD', 'AO', 'JMD', 'ACCOUNTS', 'TALLY'].includes(b.current_stage))
  );
};
