import { AuditAction, AuditLogEntry, AuditSource, DfrUser, ProcessStage } from '../types/dfr';

const AUDIT_STORAGE_KEY = 'DFR_AUDIT_LOGS_V2';
const EVENT_SIGNATURES_KEY = 'DFR_AUDIT_EVENT_SIGNATURES_V2';

export const formatAuditActionLabel = (action: AuditAction | string): string => {
  const norm = (action || '').toUpperCase().trim();
  switch (norm) {
    case 'BILL_RECEIVED':
    case 'BILL_INWARD_INTAKE':
    case 'INTAKE':
      return 'Bill Received';
    case 'CHECKED':
    case 'IAD_CHECK':
      return 'Checked';
    case 'PASSED':
    case 'STAGE_PASS':
    case 'APPROVAL_PASS':
      return 'Passed';
    case 'REJECTED':
      return 'Rejected';
    case 'MOVED':
    case 'HANDOVER':
      return 'Moved';
    case 'TALLY_EXPORTED':
    case 'MOVE_TO_TALLY':
      return 'Tally Exported';
    case 'FILED':
    case 'FILING_COMPLETED':
      return 'Filed';
    case 'FILING_REVOKED':
      return 'Filing Revoked';
    case 'LOGIN':
      return 'Login';
    case 'LOGOUT':
      return 'Logout';
    case 'PAYMENT_COMPLETE':
      return 'Payment Done';
    case 'ERP_SYNC':
    case 'MANUAL_SYNC':
      return 'Sync';
    case 'CATEGORY_MAP_CREATE':
    case 'CATEGORY_MAP_UPDATE':
    case 'CATEGORY_MAP_DELETE':
    case 'USER_CREATE':
    case 'USER_UPDATE':
    case 'USER_DISABLE':
    case 'PASSWORD_RESET':
    case 'LABEL_CHANGE':
    case 'SETTINGS_UPDATE':
      return 'Settings Changed';
    case 'ALERT_ACKNOWLEDGE':
      return 'Alert Acknowledged';
    default:
      return action.replace(/_/g, ' ');
  }
};

export const formatAuditTimeOnly = (isoString?: string | null): string => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
};

export const formatAuditDateOnly = (isoString?: string | null): string => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

export const formatAuditDateTimeDisplay = (isoString?: string | null): string => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    const dateStr = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${timeStr} | ${dateStr}`;
  } catch {
    return '—';
  }
};

export interface AuditLogMeta {
  header_id?: number;
  br_no?: string;
  bill_no?: string;
  user_id?: string;
  user_name?: string;
  user_role?: string;
  previous_stage?: ProcessStage | string | null;
  new_stage?: ProcessStage | string | null;
  previous_holder?: string | null;
  new_holder?: string | null;
  status_before?: string | null;
  status_after?: string | null;
  rejection_reason?: string | null;
  note?: string | null;
  source?: AuditSource;
  timestamp?: string;
  previous_value?: string;
  new_value?: string;
  action_label?: string;
}

class AuditService {
  private logs: AuditLogEntry[] = [];
  private eventSignatures: Set<string> = new Set();
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadState();
    if (this.logs.length === 0) {
      this.seedInitialLogs();
    }
  }

  private loadState() {
    const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: AuditLogEntry[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.logs = parsed.filter(
            l => l.action !== 'ERP_SYNC' && l.action !== 'MANUAL_SYNC' && l.action !== 'SYNC'
          );
        }
      } catch (e) {
        console.error('Failed to parse audit logs:', e);
        this.logs = [];
      }
    }

    const savedSigs = localStorage.getItem(EVENT_SIGNATURES_KEY);
    if (savedSigs) {
      try {
        const arr = JSON.parse(savedSigs);
        if (Array.isArray(arr)) {
          this.eventSignatures = new Set(arr);
        }
      } catch (e) {
        this.eventSignatures = new Set();
      }
    }
  }

  private seedInitialLogs() {
    const now = new Date();
    const t1 = new Date(now.getTime() - 86400000).toISOString();
    const t2 = new Date(now.getTime() - 80000000).toISOString();

    this.logs = [
      {
        id: 1,
        user_id: 'user-010',
        user_name: 'DFR_ADMIN',
        user_role: 'ADMIN',
        action: 'SETTINGS_UPDATE',
        action_label: 'Settings Changed',
        details: 'DFR enterprise system initialized with default operational user accounts',
        source: 'DFR',
        timestamp: t1,
        date: formatAuditDateOnly(t1),
        time: formatAuditTimeOnly(t1),
      },
      {
        id: 2,
        user_id: 'user-010',
        user_name: 'DFR_ADMIN',
        user_role: 'ADMIN',
        action: 'CATEGORY_MAP_CREATE',
        action_label: 'Settings Changed',
        details: 'Configured initial intake routing rules for CHEMICAL, DYES, POLYBAG, MAINTENANCE, ELECTRICAL, STATIONARY, CLEANING PURPOSE',
        source: 'DFR',
        timestamp: t2,
        date: formatAuditDateOnly(t2),
        time: formatAuditTimeOnly(t2),
      },
    ];
    this.saveLogs();
  }

  private saveLogs() {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.logs.slice(0, 3000))); // Keep last 3000 logs
      localStorage.setItem(
        EVENT_SIGNATURES_KEY,
        JSON.stringify(Array.from(this.eventSignatures).slice(-3000))
      );
    } catch (e) {
      console.warn('Failed to save audit logs to localStorage:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public log(
    action: AuditAction | string,
    details: string,
    user?: DfrUser | { id?: string; username?: string; full_name?: string; role?: string } | null,
    meta?: AuditLogMeta
  ): AuditLogEntry | null {
    // Exclude raw automatic background sync heartbeats from cluttering the table
    if (action === 'ERP_SYNC' || action === 'MANUAL_SYNC' || action === 'SYNC') {
      return null;
    }

    const timestamp = meta?.timestamp || new Date().toISOString();
    const nextId = this.logs.length > 0 ? Math.max(...this.logs.map(l => l.id)) + 1 : 1;

    const entry: AuditLogEntry = {
      id: nextId,
      header_id: meta?.header_id,
      br_no: meta?.br_no,
      bill_no: meta?.bill_no,
      user_id: meta?.user_id || user?.id || 'SYSTEM',
      user_name: meta?.user_name || user?.full_name || (user as any)?.username || 'SYSTEM',
      user_role: meta?.user_role || user?.role || 'STAFF',
      action,
      action_label: meta?.action_label || formatAuditActionLabel(action),
      previous_stage: meta?.previous_stage || null,
      new_stage: meta?.new_stage || null,
      previous_holder: meta?.previous_holder || null,
      new_holder: meta?.new_holder || null,
      status_before: meta?.status_before || null,
      status_after: meta?.status_after || null,
      rejection_reason: meta?.rejection_reason || null,
      note: meta?.note || null,
      details,
      source: meta?.source || 'DFR',
      timestamp,
      date: meta?.timestamp ? formatAuditDateOnly(meta.timestamp) : formatAuditDateOnly(timestamp),
      time: meta?.timestamp ? formatAuditTimeOnly(meta.timestamp) : formatAuditTimeOnly(timestamp),
      previous_value: meta?.previous_value,
      new_value: meta?.new_value,
    };

    this.logs.unshift(entry);
    this.saveLogs();
    return entry;
  }

  /**
   * Logs a deduplicated event. If the signature has already been recorded, skips logging.
   */
  public logUniqueEvent(
    signature: string,
    action: AuditAction | string,
    details: string,
    user?: DfrUser | { id?: string; username?: string; full_name?: string; role?: string } | null,
    meta?: AuditLogMeta
  ): AuditLogEntry | null {
    if (this.eventSignatures.has(signature)) {
      return null;
    }
    this.eventSignatures.add(signature);
    return this.log(action, details, user, meta);
  }

  public getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  public getLogsForBill(headerId: number): AuditLogEntry[] {
    return this.logs
      .filter(l => l.header_id === headerId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public clearLogs() {
    this.logs = [];
    this.eventSignatures.clear();
    this.saveLogs();
  }

  public exportCsv(filteredLogs?: AuditLogEntry[]): string {
    const list = filteredLogs || this.logs;
    const headers = [
      'ID',
      'Timestamp',
      'Date',
      'Time',
      'Header ID',
      'BR No',
      'Bill No',
      'User Name',
      'User Role',
      'Action',
      'Action Label',
      'Previous Stage',
      'New Stage',
      'Previous Holder',
      'New Holder',
      'Status Before',
      'Status After',
      'Rejection Reason',
      'Details',
      'Note',
      'Source',
    ];

    const rows = list.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.date || formatAuditDateOnly(l.timestamp)}"`,
      `"${l.time || formatAuditTimeOnly(l.timestamp)}"`,
      l.header_id || '',
      `"${(l.br_no || '').replace(/"/g, '""')}"`,
      `"${(l.bill_no || '').replace(/"/g, '""')}"`,
      `"${(l.user_name || '').replace(/"/g, '""')}"`,
      `"${(l.user_role || '').replace(/"/g, '""')}"`,
      `"${l.action}"`,
      `"${(l.action_label || formatAuditActionLabel(l.action)).replace(/"/g, '""')}"`,
      `"${(l.previous_stage || '').replace(/"/g, '""')}"`,
      `"${(l.new_stage || '').replace(/"/g, '""')}"`,
      `"${(l.previous_holder || '').replace(/"/g, '""')}"`,
      `"${(l.new_holder || '').replace(/"/g, '""')}"`,
      `"${(l.status_before || '').replace(/"/g, '""')}"`,
      `"${(l.status_after || '').replace(/"/g, '""')}"`,
      `"${(l.rejection_reason || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${(l.note || '').replace(/"/g, '""')}"`,
      `"${l.source || 'DFR'}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const auditService = new AuditService();
