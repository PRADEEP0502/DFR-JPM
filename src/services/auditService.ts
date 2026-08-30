import { AuditAction, AuditLogEntry, DfrUser } from '../types/dfr';

const AUDIT_STORAGE_KEY = 'DFR_AUDIT_LOGS_V1';

class AuditService {
  private logs: AuditLogEntry[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (saved) {
      try {
        this.logs = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse audit logs:', e);
        this.logs = [];
      }
    }

    if (this.logs.length === 0) {
      this.seedInitialLogs();
    }
  }

  private seedInitialLogs() {
    const now = new Date();
    this.logs = [
      {
        id: 1,
        user_id: 'user-010',
        user_name: 'DFR_ADMIN',
        user_role: 'ADMIN',
        action: 'SETTINGS_UPDATE',
        details: 'DFR enterprise system initialized with default 10 operational user accounts',
        timestamp: new Date(now.getTime() - 86400000).toISOString(),
      },
      {
        id: 2,
        user_id: 'user-010',
        user_name: 'DFR_ADMIN',
        user_role: 'ADMIN',
        action: 'CATEGORY_MAP_CREATE',
        details: 'Configured initial intake routing rules for CHEMICAL, DYES, POLYBAG, MAINTENANCE, ELECTRICAL, STATIONARY, CLEANING PURPOSE',
        timestamp: new Date(now.getTime() - 80000000).toISOString(),
      },
      {
        id: 3,
        user_id: 'system',
        user_name: 'SYSTEM',
        user_role: 'ADMIN',
        action: 'ERP_SYNC',
        details: 'Automated Selsoft ERP incremental synchronization service started (30m interval)',
        timestamp: new Date(now.getTime() - 72000000).toISOString(),
      },
    ];
    this.saveLogs();
  }

  private saveLogs() {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.logs.slice(0, 1000))); // Keep last 1000 logs
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
    action: AuditAction,
    details: string,
    user?: DfrUser | null,
    extra?: {
      header_id?: number;
      previous_value?: string;
      new_value?: string;
    }
  ) {
    const nextId = this.logs.length > 0 ? Math.max(...this.logs.map(l => l.id)) + 1 : 1;
    const entry: AuditLogEntry = {
      id: nextId,
      user_id: user?.id || 'system',
      user_name: user?.username || user?.full_name || 'SYSTEM',
      user_role: user?.role || 'STAFF',
      action,
      details,
      header_id: extra?.header_id,
      previous_value: extra?.previous_value,
      new_value: extra?.new_value,
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(entry);
    this.saveLogs();
  }

  public getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    this.saveLogs();
  }

  public exportCsv(): string {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Details', 'Header ID', 'Previous Value', 'New Value'];
    const rows = this.logs.map(l => [
      l.id,
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${l.user_name}"`,
      `"${l.user_role}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      l.header_id || '',
      `"${(l.previous_value || '').replace(/"/g, '""')}"`,
      `"${(l.new_value || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const auditService = new AuditService();
