import {
  DfrUser,
  DfrLabel,
  ErpBill,
  DfrBill,
  HolderHistory,
  DfrAlert,
  BillRegisterItem,
  SyncState,
  ProcessStage,
  DfrStatus,
  AgeBand
} from '../types/dfr';
import { MOCK_USERS, INITIAL_LABELS, generateInitialData } from './mockData';

const STORAGE_KEY = 'DFR_APP_STATE_V2';

interface AppStorage {
  users: DfrUser[];
  labels: DfrLabel[];
  erpBills: ErpBill[];
  dfrBills: DfrBill[];
  holderHistory: HolderHistory[];
  alerts: DfrAlert[];
  billLabelsMap: Record<number, string[]>; // gb_no -> label_id[]
  syncState: SyncState;
  syncErrors: Array<{ id: number; error: string; timestamp: string }>;
}

class DfrService {
  private state: AppStorage;
  private listeners: Array<() => void> = [];

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
        this.state.users = MOCK_USERS; // Always ensure latest user definitions
      } catch (e) {
        console.error('Failed to parse saved DFR state, resetting:', e);
        this.state = this.initFreshState();
      }
    } else {
      this.state = this.initFreshState();
    }
  }

  private initFreshState(): AppStorage {
    const initialData = generateInitialData();
    const state: AppStorage = {
      users: MOCK_USERS,
      labels: INITIAL_LABELS,
      erpBills: initialData.erpBills,
      dfrBills: initialData.dfrBills,
      holderHistory: initialData.holderHistory,
      alerts: initialData.alerts,
      billLabelsMap: initialData.billLabelsMap,
      syncState: {
        last_synced_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        is_syncing: false,
        total_bills: initialData.dfrBills.length,
        sync_errors_count: 0
      },
      syncErrors: []
    };
    this.saveStateToStorage(state);
    return state;
  }

  private saveStateToStorage(state: AppStorage = this.state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    this.notifyListeners();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn());
  }

  public resetToDefault() {
    this.state = this.initFreshState();
  }

  // ============================================================================
  // READERS & COMPUTED VIEWS
  // ============================================================================

  public getUsers(): DfrUser[] {
    return this.state.users;
  }

  public getLabels(): DfrLabel[] {
    return this.state.labels;
  }

  public getSyncState(): SyncState {
    return this.state.syncState;
  }

  public getSyncErrors() {
    return this.state.syncErrors;
  }

  public getBillRegister(includeClosed: boolean = true): BillRegisterItem[] {
    const now = new Date();
    const userMap = new Map(this.state.users.map(u => [u.id, u.full_name]));
    const labelMap = new Map(this.state.labels.map(l => [l.id, l]));

    const erpMap = new Map(this.state.erpBills.map(e => [e.erp_bill_ref, e]));

    const items: BillRegisterItem[] = [];

    for (const b of this.state.dfrBills) {
      if (!includeClosed && (b.dfr_status === 'PAID' || b.dfr_status === 'CLOSED')) {
        continue; // Exclude closed bills from active views
      }

      const e = erpMap.get(b.erp_bill_ref);
      if (!e) continue;

      const effectiveRecdDate = e.bill_recd_date || e.bill_date;
      const recdDateObj = new Date(effectiveRecdDate);
      
      // Compute Overall Ageing (Days)
      const diffTime = Math.max(0, now.getTime() - recdDateObj.getTime());
      const ageDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Age Band
      let ageBand: AgeBand = 'NORMAL';
      if (ageDays >= 10) ageBand = 'A-10';
      else if (ageDays >= 5) ageBand = 'A-5';
      else if (ageDays >= 3) ageBand = 'A-3';

      // Tally Ageing (Days since posted to Tally)
      let tallyAgeDays: number | undefined = undefined;
      if (e.tally_posted_at) {
        const tallyDateObj = new Date(e.tally_posted_at);
        const tallyDiffTime = Math.max(0, now.getTime() - tallyDateObj.getTime());
        tallyAgeDays = Math.floor(tallyDiffTime / (1000 * 60 * 60 * 24));
      }

      // Labels array
      const labelIds = this.state.billLabelsMap[b.gb_no] || [];
      const billLabels = labelIds
        .map(id => labelMap.get(id))
        .filter((l): l is DfrLabel => l !== undefined);

      items.push({
        gb_no: b.gb_no,
        erp_bill_ref: b.erp_bill_ref,
        bill_dc_no: e.bill_dc_no,
        bill_date: e.bill_date,
        party_name: e.party_name,
        amount: e.amount,
        category: e.category,
        owner_id: b.owner_id,
        owner_name: userMap.get(b.owner_id) || 'Unknown',
        current_holder_id: b.current_holder_id,
        current_holder_name: userMap.get(b.current_holder_id) || 'Unknown',
        current_stage: b.current_stage,
        dfr_status: b.dfr_status,
        effective_recd_date: effectiveRecdDate,
        age_days: ageDays,
        age_band: ageBand,
        tally_posted_at: e.tally_posted_at,
        tally_age_days: tallyAgeDays,
        moved_to_tally: !!e.tally_posted_at,
        payment_status: e.payment_status,
        payment_completed_at: e.payment_completed_at,
        labels: billLabels,
      });
    }

    // Sort by gb_no descending
    return items.sort((a, b) => b.gb_no - a.gb_no);
  }

  public getHolderHistory(gbNo: number): HolderHistory[] {
    return this.state.holderHistory
      .filter(h => h.gb_no === gbNo)
      .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
  }

  public getAlerts(): DfrAlert[] {
    return this.state.alerts;
  }

  // ============================================================================
  // MULTI-LABEL OPERATIONS
  // ============================================================================

  public createLabel(name: string, color: string, description?: string): DfrLabel {
    const newLabel: DfrLabel = {
      id: `lbl-${Date.now()}`,
      name: name.trim(),
      color,
      description: description?.trim()
    };
    this.state.labels.push(newLabel);
    this.saveStateToStorage();
    return newLabel;
  }

  public updateLabel(id: string, name: string, color: string, description?: string) {
    const lbl = this.state.labels.find(l => l.id === id);
    if (lbl) {
      lbl.name = name.trim();
      lbl.color = color;
      lbl.description = description?.trim();
      this.saveStateToStorage();
    }
  }

  public deleteLabel(id: string) {
    this.state.labels = this.state.labels.filter(l => l.id !== id);
    // Clean up billLabelsMap
    for (const gbNo in this.state.billLabelsMap) {
      this.state.billLabelsMap[gbNo] = (this.state.billLabelsMap[gbNo] || []).filter(lId => lId !== id);
    }
    this.saveStateToStorage();
  }

  public toggleBillLabel(gbNo: number, labelId: string) {
    const current = this.state.billLabelsMap[gbNo] || [];
    if (current.includes(labelId)) {
      this.state.billLabelsMap[gbNo] = current.filter(id => id !== labelId);
    } else {
      this.state.billLabelsMap[gbNo] = [...current, labelId];
    }
    this.saveStateToStorage();
  }

  // ============================================================================
  // HUMAN CHECKPOINT ACTIONS
  // ============================================================================

  public confirmHandover(
    gbNo: number,
    toHolderId: string,
    toStage: ProcessStage,
    actorUserId: string,
    note: string
  ) {
    const b = this.state.dfrBills.find(x => x.gb_no === gbNo);
    if (!b) return;

    const fromHolderId = b.current_holder_id;
    const fromStage = b.current_stage;

    b.current_holder_id = toHolderId;
    b.current_stage = toStage;
    b.updated_at = new Date().toISOString();

    const maxHistoryId = this.state.holderHistory.reduce((max, h) => Math.max(max, h.id), 0);
    this.state.holderHistory.push({
      id: maxHistoryId + 1,
      gb_no: gbNo,
      from_holder_id: fromHolderId,
      to_holder_id: toHolderId,
      from_stage: fromStage,
      to_stage: toStage,
      changed_by: actorUserId,
      note: note || 'Physical handover confirmed',
      changed_at: new Date().toISOString()
    });

    this.saveStateToStorage();
  }

  public markMovedToTally(gbNo: number, actorUserId: string, note?: string) {
    const b = this.state.dfrBills.find(x => x.gb_no === gbNo);
    const e = this.state.erpBills.find(x => x.erp_bill_ref === b?.erp_bill_ref);
    if (!b || !e) return;

    const nowIso = new Date().toISOString();
    const fromHolderId = b.current_holder_id;
    const fromStage = b.current_stage;

    b.current_stage = 'TALLY';
    b.dfr_status = 'TALLY_DONE';
    b.updated_at = nowIso;

    e.tally_ref = `TALLY-REF-${Date.now()}`;
    e.tally_posted_at = nowIso;
    if (e.payment_status === 'NOT_STARTED') {
      e.payment_status = 'PENDING';
    }

    const maxHistoryId = this.state.holderHistory.reduce((max, h) => Math.max(max, h.id), 0);
    this.state.holderHistory.push({
      id: maxHistoryId + 1,
      gb_no: gbNo,
      from_holder_id: fromHolderId,
      to_holder_id: actorUserId,
      from_stage: fromStage,
      to_stage: 'TALLY',
      changed_by: actorUserId,
      note: note || 'Confirmed bill posted into Tally software',
      changed_at: nowIso
    });

    this.saveStateToStorage();
  }

  public markPaymentCompleted(gbNo: number, actorUserId: string, note?: string) {
    const b = this.state.dfrBills.find(x => x.gb_no === gbNo);
    const e = this.state.erpBills.find(x => x.erp_bill_ref === b?.erp_bill_ref);
    if (!b || !e) return;

    const nowIso = new Date().toISOString();
    const fromHolderId = b.current_holder_id;
    const fromStage = b.current_stage;

    b.current_stage = 'PAYMENT';
    b.dfr_status = 'PAID';
    b.updated_at = nowIso;

    e.payment_ref = `PAY-TXN-${Date.now()}`;
    e.payment_status = 'COMPLETED';
    e.payment_completed_at = nowIso;

    const maxHistoryId = this.state.holderHistory.reduce((max, h) => Math.max(max, h.id), 0);
    this.state.holderHistory.push({
      id: maxHistoryId + 1,
      gb_no: gbNo,
      from_holder_id: fromHolderId,
      to_holder_id: actorUserId,
      from_stage: fromStage,
      to_stage: 'PAYMENT',
      changed_by: actorUserId,
      note: note || 'Confirmed bank payment completion & voucher posting',
      changed_at: nowIso
    });

    this.saveStateToStorage();
  }

  public acknowledgeAlert(alertId: number, userId: string) {
    const alert = this.state.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged_by = userId;
      alert.acknowledged_at = new Date().toISOString();
      this.saveStateToStorage();
    }
  }

  // ============================================================================
  // NEAR-REAL-TIME ERP SYNC SIMULATION
  // ============================================================================

  public async syncErpBillsNow(): Promise<SyncState> {
    this.state.syncState.is_syncing = true;
    this.notifyListeners();

    // Simulate API delay
    await new Promise(res => setTimeout(res, 800));

    const now = new Date();
    const nowIso = now.toISOString();

    // 10% chance of generating a new ERP bill during sync simulation
    if (Math.random() > 0.4) {
      const newIndex = this.state.dfrBills.length + 1;
      const gbNo = 1000 + newIndex;
      const erpRef = `ERP-2026-${(10000 + newIndex).toString()}`;
      const vendors = [
        'LAKSHMI COTTON MILLS', 'SRI RAMA TEXTILES', 'KAVERI YARNS LTD', 'COIMBATORE SPINNERS',
        'JAYAM TRADERS', 'BHARANI DYEING PROCESS', 'THIRUMALAI TEXTILES', 'NEXUS CHEMICALS CORP'
      ];
      const vendor = vendors[newIndex % vendors.length];
      const amount = Math.floor((Math.random() * 250000 + 10000) / 100) * 100;

      const newErpBill: ErpBill = {
        erp_bill_ref: erpRef,
        bill_dc_no: `INV/2026/${4000 + newIndex}`,
        bill_date: nowIso.split('T')[0],
        party_name: vendor,
        amount: amount,
        category: 'CREDIT BILL',
        bill_recd_date: nowIso.split('T')[0],
        payment_status: 'NOT_STARTED',
        last_synced_at: nowIso,
      };

      const unassignedUser = this.state.users.find(u => u.id === 'user-000') || this.state.users[0];

      const newDfrBill: DfrBill = {
        gb_no: gbNo,
        erp_bill_ref: erpRef,
        owner_id: unassignedUser.id,
        current_holder_id: unassignedUser.id,
        current_stage: 'IAD',
        dfr_status: 'OPEN',
        created_at: nowIso,
        updated_at: nowIso,
      };

      this.state.erpBills.unshift(newErpBill);
      this.state.dfrBills.unshift(newDfrBill);

      const maxHistoryId = this.state.holderHistory.reduce((max, h) => Math.max(max, h.id), 0);
      this.state.holderHistory.push({
        id: maxHistoryId + 1,
        gb_no: gbNo,
        from_holder_id: null,
        to_holder_id: unassignedUser.id,
        from_stage: null,
        to_stage: 'IAD',
        changed_by: unassignedUser.id,
        note: 'Auto-intake from Selsoft ERP API Sync',
        changed_at: nowIso,
      });
    }

    this.state.syncState = {
      last_synced_at: nowIso,
      is_syncing: false,
      total_bills: this.state.dfrBills.length,
      sync_errors_count: this.state.syncErrors.length,
    };

    this.saveStateToStorage();
    return this.state.syncState;
  }
}

export const dfrService = new DfrService();
