import {
  BillRegisterItem,
  DfrUser,
  DfrLabel,
  CategoryHolderMapping,
  ErpBill,
  DfrBillTracking,
  HolderHistory,
  DfrAlert,
  SyncState,
  ProcessStage,
  STAGE_DISPLAY_NAMES,
  AgeBand,
} from '../types/dfr';
import { INITIAL_LABELS, INITIAL_CATEGORY_MAPPINGS } from './mockData';
import { authService } from './authService';
import { auditService } from './auditService';
import { selsoftApiClient, mapErpToDfrStage } from './selsoftApi';

const STORAGE_KEY = 'DFR_APP_STATE_ENTERPRISE_V6';

interface AppStorage {
  users: DfrUser[];
  labels: DfrLabel[];
  categoryMappings: CategoryHolderMapping[];
  erpBills: ErpBill[];
  dfrBills: DfrBillTracking[];
  holderHistory: HolderHistory[];
  alerts: DfrAlert[];
  billLabelsMap: Record<number, string[]>; // header_id -> label_id[]
  syncState: SyncState;
  syncErrors: Array<{ id: number; error: string; timestamp: string }>;
}

class DfrService {
  private state: AppStorage;
  private listeners: Array<() => void> = [];
  private syncTimerId: any = null;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
        this.state.users = authService.getUsers(); // Always ensure latest user definitions
        if (!this.state.categoryMappings || this.state.categoryMappings.length === 0) {
          this.state.categoryMappings = INITIAL_CATEGORY_MAPPINGS;
        }
      } catch (e) {
        console.error('Failed to parse saved DFR state, resetting:', e);
        this.state = this.initFreshState();
      }
    } else {
      this.state = this.initFreshState();
    }

    // Subscribe to auth changes to keep user list in sync
    authService.subscribe(() => {
      this.state.users = authService.getUsers();
      this.notifyListeners();
    });

    this.startAutoSyncSchedule();

    // Trigger immediate live sync on service startup
    this.syncErpBillsNow(true).catch(err => {
      console.warn('Initial live sync error:', err);
    });
  }

  private initFreshState(): AppStorage {
    const now = new Date();
    const intervalMins = 30; // Default 30-minute sync
    const nextSync = new Date(now.getTime() + intervalMins * 60 * 1000).toISOString();

    const state: AppStorage = {
      users: authService.getUsers(),
      labels: INITIAL_LABELS,
      categoryMappings: INITIAL_CATEGORY_MAPPINGS,
      erpBills: [],
      dfrBills: [],
      holderHistory: [],
      alerts: [],
      billLabelsMap: {},
      syncState: {
        last_synced_at: null,
        next_sync_at: nextSync,
        sync_interval_mins: intervalMins,
        is_syncing: false,
        total_count: 0,
        total_pages: 0,
        sync_errors_count: 0,
      },
      syncErrors: [],
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

  public resetToLiveErp() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.initFreshState();
    return this.syncErpBillsNow(true);
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

  public getCategoryMappings(): CategoryHolderMapping[] {
    return this.state.categoryMappings || INITIAL_CATEGORY_MAPPINGS;
  }

  public getAlerts(): DfrAlert[] {
    return this.state.alerts;
  }

  public getSyncState(): SyncState {
    return this.state.syncState;
  }

  public getSyncErrors() {
    return this.state.syncErrors;
  }

  public getRawErpBills(): ErpBill[] {
    return this.state.erpBills;
  }

  /**
   * Resolves the initial holder for a newly ingested ERP bill based on active category mappings.
   * Applied strictly when a bill is at Bill Inward stage.
   */
  public resolveInitialHolderForCategory(categoryStr: string): DfrUser {
    const normalizedCat = (categoryStr || '').trim().toUpperCase();
    const mappings = (this.state.categoryMappings || INITIAL_CATEGORY_MAPPINGS).filter(m => m.is_active);

    // 1. Exact match
    const exact = mappings.find(m => m.category.toUpperCase() === normalizedCat);
    if (exact) {
      const u = this.state.users.find(x => x.id === exact.holder_id);
      if (u) return u;
    }

    // 2. Partial/contains match
    const partial = mappings.find(
      m =>
        normalizedCat.includes(m.category.toUpperCase()) ||
        m.category.toUpperCase().includes(normalizedCat)
    );
    if (partial) {
      const u = this.state.users.find(x => x.id === partial.holder_id);
      if (u) return u;
    }

    // 3. Fallback default staff
    const staffUsers = this.state.users.filter(
      u => u.id !== 'user-000' && u.id !== 'user-009' && u.id !== 'user-008'
    );
    return staffUsers[0] || this.state.users[0];
  }



  /**
   * Master Bill Register View:
   * Dynamic computed view combining ERP read-only fields with DFR operational state
   */
  public getBillRegister(includeClosed: boolean = true): BillRegisterItem[] {
    const userMap = new Map(this.state.users.map(u => [u.id, u.full_name]));
    const labelMap = new Map(this.state.labels.map(l => [l.id, l]));
    const now = new Date('2026-08-27T12:00:00Z');

    const dfrMap = new Map(this.state.dfrBills.map(d => [d.header_id, d]));

    const items: BillRegisterItem[] = [];

    for (const erp of this.state.erpBills) {
      const isClosed = erp.bill_status === 'PAID' || erp.bill_status === 'CLOSED';
      if (!includeClosed && isClosed) {
        continue; // Exclude closed bills from active views
      }

      const stage = mapErpToDfrStage(erp);
      const initialHolder = this.resolveInitialHolderForCategory(erp.category);

      const dfr = dfrMap.get(erp.header_id) || {
        header_id: erp.header_id,
        current_holder_id: initialHolder.id,
        current_stage: stage,
        dfr_status: isClosed ? 'PAID' : 'OPEN',
        created_at: new Date(erp.br_date).toISOString(),
        updated_at: erp.last_modified_datetime,
      };

      // Strict Ageing Formula: Age = Current Date - BRDate (BRDate is the ONLY basis for age_days)
      const brDateObj = new Date(erp.br_date);
      const diffTime = Math.max(0, now.getTime() - brDateObj.getTime());
      const ageDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Business Rule: ONLY genuinely exported bills are excluded from A-10 Critical.
      // Bills at pre-accounts stages (BILL_INWARD, IAD, AO, JMD) are NEVER excluded!
      const isAccountsExported =
        (erp.tally_status?.toUpperCase() === 'EXPORTED' ||
         erp.tally_status?.toUpperCase() === 'POSTED' ||
         dfr.dfr_status === 'TALLY_DONE' ||
         erp.bill_status === 'PAID') &&
        (dfr.current_stage === 'TALLY' ||
         erp.tally_status?.toUpperCase() === 'EXPORTED' ||
         erp.tally_status?.toUpperCase() === 'POSTED');

      // Ageing Bands: 0-2: NORMAL, 3-4: A-3, 5-9: A-5, 10+: A-10 Critical (only if NOT Accounts Exported)
      let ageBand: AgeBand = 'NORMAL';
      if (ageDays >= 10) {
        ageBand = isAccountsExported ? 'NORMAL' : 'A-10';
      } else if (ageDays >= 5) {
        ageBand = isAccountsExported ? 'NORMAL' : 'A-5';
      } else if (ageDays >= 3) {
        ageBand = isAccountsExported ? 'NORMAL' : 'A-3';
      }

      // Multi-labels
      const labelIds = this.state.billLabelsMap[erp.header_id] || [];
      const billLabels = labelIds
        .map(id => labelMap.get(id))
        .filter((l): l is DfrLabel => l !== undefined);

      items.push({
        header_id: erp.header_id,
        br_no: erp.br_no,
        br_date: erp.br_date,
        bill_no: erp.bill_no,
        bill_date: erp.bill_date,
        supplier: erp.supplier,
        amount: erp.amount,
        category: erp.category,
        current_holder_id: dfr.current_holder_id,
        current_holder_name: userMap.get(dfr.current_holder_id) || initialHolder.full_name,
        current_stage: dfr.current_stage,
        age_days: ageDays,
        age_band: ageBand,
        approval_status: erp.approval_status,
        next_approver: erp.next_approver,
        rejected_by: erp.rejected_by,
        rejection_reason: erp.rejection_reason,
        tally_status: erp.tally_status,
        tally_exported_date: erp.tally_exported_date,
        bill_status: erp.bill_status,
        dfr_status: dfr.dfr_status,
        labels: billLabels,
      });
    }

    return items;
  }

  public getHolderHistory(headerId: number): HolderHistory[] {
    return this.state.holderHistory
      .filter(h => h.header_id === headerId)
      .sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime());
  }

  // ============================================================================
  // MUTATIONS (Category Mappings & Human Checkpoints)
  // ============================================================================

  public addCategoryMapping(category: string, holderId: string) {
    const user = this.state.users.find(u => u.id === holderId);
    const newMapping: CategoryHolderMapping = {
      id: `map-${Date.now()}`,
      category: category.trim().toUpperCase(),
      holder_id: holderId,
      holder_name: user?.full_name || 'Staff',
      is_active: true,
      updated_at: new Date().toISOString(),
    };
    this.state.categoryMappings.push(newMapping);
    this.saveStateToStorage();

    auditService.log(
      'CATEGORY_MAP_CREATE',
      `Added category mapping: ${newMapping.category} → ${newMapping.holder_name}`,
      authService.getCurrentUser()
    );
  }

  public updateCategoryMapping(id: string, category: string, holderId: string, isActive: boolean = true) {
    const user = this.state.users.find(u => u.id === holderId);
    this.state.categoryMappings = (this.state.categoryMappings || []).map(m => {
      if (m.id === id) {
        return {
          ...m,
          category: category.trim().toUpperCase(),
          holder_id: holderId,
          holder_name: user?.full_name || m.holder_name,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        };
      }
      return m;
    });
    this.saveStateToStorage();

    auditService.log(
      'CATEGORY_MAP_UPDATE',
      `Updated category mapping: ${category.trim().toUpperCase()} → ${user?.full_name || holderId} (${isActive ? 'Active' : 'Inactive'})`,
      authService.getCurrentUser()
    );
  }

  public deleteCategoryMapping(id: string) {
    const m = (this.state.categoryMappings || []).find(x => x.id === id);
    this.state.categoryMappings = (this.state.categoryMappings || []).filter(item => item.id !== id);
    this.saveStateToStorage();

    auditService.log(
      'CATEGORY_MAP_DELETE',
      `Deleted category mapping for ${m?.category || id}`,
      authService.getCurrentUser()
    );
  }

  public createLabel(name: string, color: string, description?: string): DfrLabel {
    const newLabel: DfrLabel = {
      id: `lbl-${Date.now()}`,
      name,
      color,
      description,
    };
    this.state.labels.push(newLabel);
    this.saveStateToStorage();

    auditService.log(
      'LABEL_CHANGE',
      `Created custom label "${name}" (${color})`,
      authService.getCurrentUser()
    );

    return newLabel;
  }

  public updateLabel(id: string, name: string, color: string, description?: string) {
    const lbl = this.state.labels.find(l => l.id === id);
    if (lbl) {
      lbl.name = name;
      lbl.color = color;
      lbl.description = description;
      this.saveStateToStorage();

      auditService.log(
        'LABEL_CHANGE',
        `Updated custom label "${name}"`,
        authService.getCurrentUser()
      );
    }
  }

  public deleteLabel(id: string) {
    const lbl = this.state.labels.find(l => l.id === id);
    this.state.labels = this.state.labels.filter(l => l.id !== id);
    // Clean up bill associations
    Object.keys(this.state.billLabelsMap).forEach(headerIdStr => {
      const headerId = Number(headerIdStr);
      this.state.billLabelsMap[headerId] = (this.state.billLabelsMap[headerId] || []).filter(
        lId => lId !== id
      );
    });
    this.saveStateToStorage();

    auditService.log(
      'LABEL_CHANGE',
      `Deleted custom label "${lbl?.name || id}"`,
      authService.getCurrentUser()
    );
  }

  public toggleBillLabel(headerId: number, labelId: string) {
    const list = this.state.billLabelsMap[headerId] || [];
    if (list.includes(labelId)) {
      this.state.billLabelsMap[headerId] = list.filter(id => id !== labelId);
    } else {
      this.state.billLabelsMap[headerId] = [...list, labelId];
    }
    this.saveStateToStorage();
  }

  public confirmHandover(
    headerId: number,
    toHolderId: string,
    toStage: ProcessStage,
    actorUserId: string,
    note?: string
  ) {
    let dfr = this.state.dfrBills.find(x => x.header_id === headerId);
    if (!dfr) {
      dfr = {
        header_id: headerId,
        current_holder_id: toHolderId,
        current_stage: toStage,
        dfr_status: 'OPEN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.state.dfrBills.push(dfr);
    }

    const fromHolderId = dfr.current_holder_id;
    const fromStage = dfr.current_stage;

    dfr.current_holder_id = toHolderId;
    dfr.current_stage = toStage;
    dfr.updated_at = new Date().toISOString();

    const maxHistoryId = this.state.holderHistory.reduce((max, h) => Math.max(max, h.id), 0);
    this.state.holderHistory.push({
      id: maxHistoryId + 1,
      header_id: headerId,
      from_holder_id: fromHolderId,
      to_holder_id: toHolderId,
      from_stage: fromStage,
      to_stage: toStage,
      changed_by: actorUserId,
      source: 'Manual Handover',
      note: note || 'Physical custody handover confirmed',
      changed_at: new Date().toISOString(),
    });

    this.saveStateToStorage();

    const actor = authService.getCurrentUser();
    const fromUser = this.state.users.find(u => u.id === fromHolderId);
    const toUser = this.state.users.find(u => u.id === toHolderId);

    auditService.log(
      'HANDOVER',
      `Confirmed custody handover for bill #${headerId}: ${fromUser?.full_name || 'Inward'} → ${toUser?.full_name || toHolderId} (${STAGE_DISPLAY_NAMES[toStage]})`,
      actor,
      {
        header_id: headerId,
        previous_value: fromUser?.full_name,
        new_value: toUser?.full_name,
      }
    );
  }

  public setSyncInterval(minutes: number) {
    const mins = Math.max(1, minutes);
    this.state.syncState.sync_interval_mins = mins;
    const now = new Date();
    this.state.syncState.next_sync_at = new Date(now.getTime() + mins * 60 * 1000).toISOString();
    this.saveStateToStorage();
    this.startAutoSyncSchedule();

    auditService.log(
      'SETTINGS_UPDATE',
      `Updated Selsoft ERP auto-sync schedule interval to ${mins} minutes`,
      authService.getCurrentUser()
    );
  }

  public markMovedToTally(headerId: number, actorUserId: string, note?: string) {
    const dfr = this.state.dfrBills.find(x => x.header_id === headerId);
    const erp = this.state.erpBills.find(x => x.header_id === headerId);
    if (!dfr || !erp) return;

    const nowIso = new Date().toISOString();
    const fromHolderId = dfr.current_holder_id;
    const fromStage = dfr.current_stage;

    dfr.current_stage = 'TALLY';
    dfr.dfr_status = 'TALLY_DONE';
    dfr.updated_at = nowIso;

    erp.tally_status = 'EXPORTED';
    erp.tally_exported_date = nowIso;

    const maxHistoryId = this.state.holderHistory.reduce((max, h) => Math.max(max, h.id), 0);
    this.state.holderHistory.push({
      id: maxHistoryId + 1,
      header_id: headerId,
      from_holder_id: fromHolderId,
      to_holder_id: actorUserId,
      from_stage: fromStage,
      to_stage: 'TALLY',
      changed_by: actorUserId,
      note: note || 'Confirmed bill posted to Tally software',
      changed_at: nowIso,
    });

    // Rule: Immediately exclude from A-10 Critical alerts upon Accounts/Tally Export
    this.state.alerts = this.state.alerts.filter(
      a => !(a.header_id === headerId && a.band === 'A-10')
    );

    this.saveStateToStorage();
  }

  public markPaymentCompleted(headerId: number, actorUserId: string, note?: string) {
    const dfr = this.state.dfrBills.find(x => x.header_id === headerId);
    const erp = this.state.erpBills.find(x => x.header_id === headerId);
    if (!dfr || !erp) return;

    const nowIso = new Date().toISOString();
    const fromHolderId = dfr.current_holder_id;
    const fromStage = dfr.current_stage;

    dfr.dfr_status = 'PAID';
    dfr.updated_at = nowIso;

    erp.bill_status = 'PAID';

    const maxHistoryId = this.state.holderHistory.reduce((max, h) => Math.max(max, h.id), 0);
    this.state.holderHistory.push({
      id: maxHistoryId + 1,
      header_id: headerId,
      from_holder_id: fromHolderId,
      to_holder_id: actorUserId,
      from_stage: fromStage,
      to_stage: fromStage,
      changed_by: actorUserId,
      note: note || 'Confirmed payment completion & bank disbursement',
      changed_at: nowIso,
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
  // SYNCHRONIZATION WITH SELSOFT ERP API
  // ============================================================================

  public async syncErpBillsNow(forceFullSync: boolean = true): Promise<SyncState> {
    this.state.syncState.is_syncing = true;
    this.notifyListeners();

    try {
      // Execute multi-page synchronization using Selsoft API Client
      const modifiedAfter = forceFullSync ? undefined : (this.state.syncState.last_synced_at || undefined);
      const result = await selsoftApiClient.fetchAllBills(50, modifiedAfter);

      if (result.allBills.length > 0) {
        // Populate directly from live Selsoft ERP API
        this.state.erpBills = result.allBills;

        const existingDfrMap = new Map(this.state.dfrBills.map(b => [b.header_id, b]));

        let maxHistoryId = this.state.holderHistory.reduce((max, h) => Math.max(max, h.id), 0);

        // Process all incoming bills: new intakes + automated stage transitions
        for (const incomingBill of result.allBills) {
          const erpStage = mapErpToDfrStage(incomingBill);

          if (!existingDfrMap.has(incomingBill.header_id)) {
            // CASE 1: Brand New Bill Ingestion (Assigned to Person via Category Mapping)
            const initialHolder = this.resolveInitialHolderForCategory(incomingBill.category);

            const newDfr: DfrBillTracking = {
              header_id: incomingBill.header_id,
              current_holder_id: initialHolder.id,
              current_stage: erpStage,
              dfr_status: incomingBill.bill_status === 'PAID' ? 'PAID' : 'OPEN',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            this.state.dfrBills.push(newDfr);
            existingDfrMap.set(incomingBill.header_id, newDfr);

            this.state.holderHistory.push({
              id: ++maxHistoryId,
              header_id: incomingBill.header_id,
              from_holder_id: null,
              to_holder_id: initialHolder.id,
              from_stage: null,
              to_stage: erpStage,
              changed_by: 'ERP_SYNC',
              source: 'ERP Sync',
              note: `Initial intake assigned to ${initialHolder.full_name} via Category Mapping (${incomingBill.category})`,
              changed_at: new Date().toISOString(),
            });
          } else {
            // CASE 2: Existing Bill — Check for ERP Process Stage Progression
            const existingDfr = existingDfrMap.get(incomingBill.header_id)!;

            if (existingDfr.current_stage !== erpStage) {
              const previousStage = existingDfr.current_stage;

              // Update stage progression
              existingDfr.current_stage = erpStage;
              existingDfr.updated_at = new Date().toISOString();

              if (incomingBill.bill_status === 'PAID') {
                existingDfr.dfr_status = 'PAID';
              }

              // Append permanent audit record to Holder History
              this.state.holderHistory.push({
                id: ++maxHistoryId,
                header_id: incomingBill.header_id,
                from_holder_id: existingDfr.current_holder_id,
                to_holder_id: existingDfr.current_holder_id,
                from_stage: previousStage,
                to_stage: erpStage,
                changed_by: 'ERP_SYNC',
                source: 'ERP Sync',
                note: `ERP process stage progressed: ${STAGE_DISPLAY_NAMES[previousStage] || previousStage} → ${STAGE_DISPLAY_NAMES[erpStage]}`,
                changed_at: new Date().toISOString(),
              });
            }
          }
        }
      }

      // Refresh A-10 alerts strictly for active, non-exported bills
      // Rule: Exclude all bills that have been Accounts/Tally Exported from A-10 Critical
      const exportedHeaderIds = new Set(
        this.state.erpBills
          .filter(
            b =>
              b.tally_status === 'EXPORTED' ||
              b.tally_status === 'POSTED' ||
              b.bill_status === 'PAID' ||
              b.bill_status === 'CLOSED'
          )
          .map(b => b.header_id)
      );

      // Purge any existing A-10 alerts for bills that are now Accounts Exported
      this.state.alerts = this.state.alerts.filter(a => !exportedHeaderIds.has(a.header_id));

      const existingAlertMap = new Set(this.state.alerts.map(a => `${a.header_id}-${a.band}`));
      let maxAlertId = this.state.alerts.reduce((max, a) => Math.max(max, a.id), 0);

      for (const bill of this.state.erpBills) {
        const isAccountsExported = exportedHeaderIds.has(bill.header_id);

        if (
          bill.bill_status !== 'PAID' &&
          bill.bill_status !== 'CLOSED' &&
          !isAccountsExported
        ) {
          const brDateObj = new Date(bill.br_date);
          const diffTime = Math.max(0, new Date().getTime() - brDateObj.getTime());
          const ageDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (ageDays >= 10 && !existingAlertMap.has(`${bill.header_id}-A-10`)) {
            this.state.alerts.push({
              id: ++maxAlertId,
              header_id: bill.header_id,
              band: 'A-10',
              raised_at: new Date(brDateObj.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            });
            existingAlertMap.add(`${bill.header_id}-A-10`);
          }
        }
      }

      const now = new Date();
      const nextSync = new Date(
        now.getTime() + this.state.syncState.sync_interval_mins * 60 * 1000
      ).toISOString();

      this.state.syncState = {
        last_synced_at: result.syncTimestampUtc,
        next_sync_at: nextSync,
        sync_interval_mins: this.state.syncState.sync_interval_mins,
        is_syncing: false,
        total_count: this.state.erpBills.length,
        total_pages: Math.ceil(this.state.erpBills.length / 50),
        sync_errors_count: this.state.syncErrors.length,
      };

      auditService.log(
        forceFullSync ? 'MANUAL_SYNC' : 'ERP_SYNC',
        `Successfully synchronized ${result.allBills.length} records from Selsoft ERP API (Total Active Bills: ${this.state.erpBills.length})`,
        authService.getCurrentUser()
      );
    } catch (err: any) {
      console.error('Sync failed:', err);
      this.state.syncState.is_syncing = false;
      this.state.syncState.last_error = err.message || 'Sync failed';
      this.state.syncErrors.push({
        id: Date.now(),
        error: err.message || 'API synchronization error',
        timestamp: new Date().toISOString(),
      });
    }

    this.saveStateToStorage();
    return this.state.syncState;
  }

  private startAutoSyncSchedule() {
    if (this.syncTimerId) {
      clearInterval(this.syncTimerId);
    }
    // Check every minute if next_sync_at has arrived
    this.syncTimerId = setInterval(() => {
      const now = new Date().getTime();
      const nextSync = new Date(this.state.syncState.next_sync_at).getTime();

      if (now >= nextSync && !this.state.syncState.is_syncing) {
        this.syncErpBillsNow(false);
      }
    }, 60 * 1000);
  }
}

export const dfrService = new DfrService();
