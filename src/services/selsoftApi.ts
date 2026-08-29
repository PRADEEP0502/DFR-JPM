import { ErpBill, SelsoftApiResponse, ProcessStage } from '../types/dfr';
import { getMockSelsoftDataset } from './mockData';

export interface SelsoftApiConfig {
  baseUrl: string;
  endpoint: string;
  defaultPageSize: number;
  useLiveApi: boolean;
}

export const DEFAULT_SELSOFT_CONFIG: SelsoftApiConfig = {
  baseUrl: ((import.meta as any).env?.VITE_SELSOFT_API_URL as string) || '/api/selsoft',
  endpoint: 'GetBillsInward',
  defaultPageSize: 50,
  useLiveApi: true, // Connects directly to live Selsoft API
};

/**
 * Normalizes raw date string from ERP into standard YYYY-MM-DD
 */
export const normalizeErpDate = (dateStr?: string | null): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  // Handles DD/MM/YYYY
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return dateStr;
};

/**
 * Stage Mapping from Selsoft ERP API response:
 * Bill Inward → IAD → AO → JMD → Accounts / Tally
 */
export const mapErpToDfrStage = (erpBill: Partial<ErpBill>): ProcessStage => {
  const tally = (erpBill.tally_status || '').trim().toUpperCase();
  const next = (erpBill.next_approver || '').trim().toUpperCase();
  const approval = (erpBill.approval_status || '').trim().toUpperCase();

  // 1. Accounts & Tally stage: Approved, exported, or with Accounts
  if (
    tally === 'EXPORTED' ||
    tally === 'POSTED' ||
    next.includes('ACCOUNT') ||
    next.includes('ACCOUNTS') ||
    approval === 'APPROVED'
  ) {
    return 'ACCOUNTS';
  }

  // 2. JMD stage
  if (next.includes('MD') || next.includes('JMD')) {
    return 'JMD';
  }

  // 3. AO stage
  if (next.includes('AO') || next.includes('ADMIN')) {
    return 'AO';
  }

  // 4. IAD stage
  if (next.includes('IAD') || approval === 'WAITING FOR APPROVAL') {
    return 'IAD';
  }

  // 5. Default initial inward intake (Preparation Pending / New)
  return 'BILL_INWARD';
};

class SelsoftApiClient {
  private config: SelsoftApiConfig;

  constructor(config: SelsoftApiConfig = DEFAULT_SELSOFT_CONFIG) {
    this.config = config;
  }

  public updateConfig(newConfig: Partial<SelsoftApiConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): SelsoftApiConfig {
    return { ...this.config };
  }

  /**
   * Fetches a single page from Selsoft GetBillsInward API
   * Endpoint: GetBillsInward?pageNumber=1&pagesize=50&modifiedAfter=...
   */
  public async fetchBillsPage(
    pageNumber: number = 1,
    pageSize: number = this.config.defaultPageSize,
    modifiedAfter?: string
  ): Promise<SelsoftApiResponse<ErpBill[]>> {
    if (!this.config.useLiveApi) {
      return this.fetchMockBillsPage(pageNumber, pageSize);
    }

    try {
      // Build request URL
      const isAbsolute = this.config.baseUrl.startsWith('http://') || this.config.baseUrl.startsWith('https://');
      const base = isAbsolute ? this.config.baseUrl : window.location.origin;
      const pathPrefix = isAbsolute ? '' : this.config.baseUrl;
      const cleanPath = `${pathPrefix}/${this.config.endpoint}`.replace(/\/+/g, '/');

      const url = new URL(cleanPath, base);
      url.searchParams.set('pageNumber', pageNumber.toString());
      url.searchParams.set('pagesize', pageSize.toString());

      if (modifiedAfter) {
        url.searchParams.set('modifiedAfter', modifiedAfter);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Selsoft API HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Expected JSON response from ERP endpoint, received '${contentType}'. Ensure proxy is active.`);
      }

      const json = await response.json();

      if (!json.Success && json.Data === undefined) {
        throw new Error(json.ErrorMessage || 'Selsoft ERP API returned an error');
      }

      // Map raw API fields to internal ErpBill schema
      const mappedData: ErpBill[] = (json.Data || []).map((raw: any) => ({
        header_id: raw.HeaderId,
        br_no: raw.BRNo || `BR-${raw.HeaderId}`,
        br_date: normalizeErpDate(raw.BRDate),
        category: raw.Category || 'GENERAL',
        supplier: raw.Supplier || 'Unknown Supplier',
        bill_no: raw.BillNo || '—',
        bill_date: normalizeErpDate(raw.BillDate),
        amount: Number(raw.Amount) || 0,
        approval_status: raw.ApprovalStatus || 'Pending',
        next_approver: raw.NextApprover || '',
        rejected_by: raw.RejectedBy || '',
        rejection_reason: raw.RejectionReason || '',
        tally_status: raw.TallyStatus || 'Waiting to Export',
        bill_status: raw.BillStatus || 'Active',
        tally_exported_date: raw.TallyExportedDate ? normalizeErpDate(raw.TallyExportedDate) : undefined,
        last_modified_datetime: raw.LastModifiedDateTime || raw.BRDate || new Date().toISOString(),
        raw_payload: raw,
      }));

      return {
        Success: json.Success !== false,
        PageNumber: json.PageNumber || pageNumber,
        PageSize: json.PageSize || pageSize,
        TotalCount: json.TotalCount || mappedData.length,
        TotalPages: json.TotalPages || Math.ceil((json.TotalCount || mappedData.length) / pageSize),
        SyncTimestampUtc: json.SyncTimestampUtc || new Date().toISOString(),
        Data: mappedData,
      };
    } catch (err: any) {
      console.error('Live Selsoft API fetch error:', err);
      throw err;
    }
  }

  /**
   * Fetches ALL available pages sequentially until all records are processed
   */
  public async fetchAllBills(
    pageSize: number = this.config.defaultPageSize,
    modifiedAfter?: string,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<{ allBills: ErpBill[]; totalCount: number; syncTimestampUtc: string }> {
    let currentPage = 1;
    let totalPages = 1;
    let totalCount = 0;
    const allBillsMap = new Map<number, ErpBill>();
    let latestSyncTimestamp = new Date().toISOString();

    do {
      const resp = await this.fetchBillsPage(currentPage, pageSize, modifiedAfter);
      if (!resp.Success && resp.Data.length === 0) {
        break;
      }

      totalPages = resp.TotalPages || 1;
      totalCount = resp.TotalCount || resp.Data.length;
      latestSyncTimestamp = resp.SyncTimestampUtc || latestSyncTimestamp;

      for (const bill of resp.Data) {
        allBillsMap.set(bill.header_id, bill);
      }

      if (onProgress) {
        onProgress(allBillsMap.size, totalCount);
      }

      currentPage++;
    } while (currentPage <= totalPages);

    return {
      allBills: Array.from(allBillsMap.values()),
      totalCount,
      syncTimestampUtc: latestSyncTimestamp,
    };
  }

  /**
   * Mock Data Fallback
   */
  private async fetchMockBillsPage(
    pageNumber: number,
    pageSize: number
  ): Promise<SelsoftApiResponse<ErpBill[]>> {
    const fullDataset = getMockSelsoftDataset();
    const totalCount = fullDataset.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIdx = (pageNumber - 1) * pageSize;
    const pageData = fullDataset.slice(startIdx, startIdx + pageSize);

    return {
      Success: true,
      PageNumber: pageNumber,
      PageSize: pageSize,
      TotalCount: totalCount,
      TotalPages: totalPages,
      SyncTimestampUtc: new Date().toISOString(),
      Data: pageData,
    };
  }
}

export const selsoftApiClient = new SelsoftApiClient();
