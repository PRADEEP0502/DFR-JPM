import { DfrUser, DfrLabel, ErpBill, DfrBill, HolderHistory, DfrAlert, DfrStatus } from '../types/dfr';

export const MOCK_USERS: DfrUser[] = [
  { id: 'user-001', full_name: 'VANITHA', role: 'STAFF', active: true },
  { id: 'user-002', full_name: 'KARUPPASAMY', role: 'STAFF', active: true },
  { id: 'user-003', full_name: 'SUGANYA', role: 'STAFF', active: true },
  { id: 'user-004', full_name: 'HEMALATHA', role: 'STAFF', active: true },
  { id: 'user-005', full_name: 'JANANI', role: 'STAFF', active: true },
  { id: 'user-006', full_name: 'JEYA SURIYA', role: 'STAFF', active: true },
  { id: 'user-007', full_name: 'ACCOUNTS', role: 'ACCOUNTS', active: true },
  { id: 'user-008', full_name: 'MANAGEMENT (MD)', role: 'MD', active: true },
  { id: 'user-000', full_name: 'Unassigned', role: 'STAFF', active: true },
];

export const INITIAL_LABELS: DfrLabel[] = [
  { id: 'lbl-001', name: 'Urgent', color: '#ef4444', description: 'Requires priority processing' },
  { id: 'lbl-002', name: 'VIP Supplier', color: '#8b5cf6', description: 'Key vendor relationship' },
  { id: 'lbl-003', name: 'Query Raised', color: '#f59e0b', description: 'Under clarification with vendor' },
  { id: 'lbl-004', name: 'Discount Eligible', color: '#10b981', description: 'Early payment cash discount available' },
  { id: 'lbl-005', name: 'Audit Sample', color: '#0284c7', description: 'Flagged for monthly internal audit' },
  { id: 'lbl-006', name: 'Tax Clarification', color: '#ec4899', description: 'GST / TDS rate verification pending' },
];

const VENDORS = [
  'LAKSHMI COTTON MILLS', 'SRI RAMA TEXTILES', 'KAVERI YARNS LTD', 'COIMBATORE SPINNERS',
  'JAYAM TRADERS', 'BHARANI DYEING PROCESS', 'THIRUMALAI TEXTILES', 'NEXUS CHEMICALS CORP',
  'ANAMALAI WEAVING MILLS', 'VELAN LOGISTICS', 'SRI VENKATESHWARA YARNS', 'KONGU PROCESSING',
  'SANGAM ENTERPRISES', 'POOMPUHAR STORES', 'BALAJI COTTON TRADING'
];

export function generateInitialData() {
  const erpBills: ErpBill[] = [];
  const dfrBills: DfrBill[] = [];
  const holderHistory: HolderHistory[] = [];
  const alerts: DfrAlert[] = [];
  const billLabelsMap: Record<number, string[]> = {};

  const now = new Date();
  const historyIdCounter = { val: 1 };
  const alertIdCounter = { val: 1 };

  // Generate 108 realistic live bill records
  for (let i = 1; i <= 108; i++) {
    const gbNo = 1000 + i;
    const erpRef = `ERP-2026-${(10000 + i).toString()}`;
    const billDcNo = i % 4 === 0 ? `MEMO-${2000 + i}` : `INV/${2026}/${3000 + i}`;
    const vendor = VENDORS[i % VENDORS.length];
    const amount = Math.floor((Math.random() * 450000 + 15000) / 100) * 100;
    const category = i % 5 === 0 ? 'CASH BILL' : 'CREDIT BILL';

    // Age distribution: 0-2 (Normal), 3-4 (A-3), 5-9 (A-5), 10-28 (A-10)
    let ageDays = 0;
    if (i <= 35) {
      ageDays = Math.floor(Math.random() * 3); // 0, 1, 2
    } else if (i <= 60) {
      ageDays = 3 + Math.floor(Math.random() * 2); // 3, 4
    } else if (i <= 85) {
      ageDays = 5 + Math.floor(Math.random() * 5); // 5-9
    } else {
      ageDays = 10 + Math.floor(Math.random() * 19); // 10-28
    }

    const recdDateObj = new Date(now);
    recdDateObj.setDate(now.getDate() - ageDays);
    const recdDateStr = recdDateObj.toISOString().split('T')[0];

    const billDateObj = new Date(recdDateObj);
    billDateObj.setDate(recdDateObj.getDate() - Math.floor(Math.random() * 4));
    const billDateStr = billDateObj.toISOString().split('T')[0];

    // Status distribution
    let dfrStatus: DfrStatus = 'OPEN';
    let tallyPostedAt: string | undefined = undefined;
    let paymentStatus: ErpBill['payment_status'] = 'NOT_STARTED';
    let paymentCompletedAt: string | undefined = undefined;

    // A subset are moved to Tally or Paid
    if (i % 7 === 0) {
      dfrStatus = 'PAID';
      paymentStatus = 'COMPLETED';
      const tallyDate = new Date(recdDateObj);
      tallyDate.setDate(tallyDate.getDate() + Math.min(2, ageDays));
      tallyPostedAt = tallyDate.toISOString();
      const paidDate = new Date(tallyDate);
      paidDate.setDate(paidDate.getDate() + 1);
      paymentCompletedAt = paidDate.toISOString();
    } else if (i % 5 === 0) {
      dfrStatus = 'TALLY_DONE';
      paymentStatus = 'PENDING';
      const tallyDate = new Date(recdDateObj);
      tallyDate.setDate(tallyDate.getDate() + Math.min(3, ageDays));
      tallyPostedAt = tallyDate.toISOString();
    } else if (i % 13 === 0) {
      dfrStatus = 'ON_HOLD';
    } else if (i % 17 === 0) {
      dfrStatus = 'CLOSED';
    }

    const erpBill: ErpBill = {
      erp_bill_ref: erpRef,
      bill_dc_no: billDcNo,
      bill_date: billDateStr,
      party_name: vendor,
      amount: amount,
      category: category,
      prn: `PRN-${5000 + i}`,
      bill_recd_date: recdDateStr,
      tally_ref: tallyPostedAt ? `TALLY-REF-${8000 + i}` : undefined,
      tally_posted_at: tallyPostedAt,
      payment_ref: paymentCompletedAt ? `PAY-TXN-${9000 + i}` : undefined,
      payment_status: paymentStatus,
      payment_completed_at: paymentCompletedAt,
      last_synced_at: new Date(now.getTime() - Math.random() * 12 * 60 * 1000).toISOString(),
    };

    // Assign owner and current holder
    const activeStaff = MOCK_USERS.filter(u => u.id !== 'user-000' && u.id !== 'user-008');
    const owner = activeStaff[i % activeStaff.length];
    const currentHolder = activeStaff[(i + 2) % activeStaff.length];

    const stages: DfrBill['current_stage'][] = ['IAD', 'AO', 'PURCHASE', 'JMD', 'ACCOUNTS', 'TALLY', 'PAYMENT'];
    const currentStage = tallyPostedAt ? 'TALLY' : (paymentCompletedAt ? 'PAYMENT' : stages[i % 5]);

    const dfrBill: DfrBill = {
      gb_no: gbNo,
      erp_bill_ref: erpRef,
      owner_id: owner.id,
      current_holder_id: currentHolder.id,
      current_stage: currentStage,
      dfr_status: dfrStatus,
      created_at: recdDateStr + 'T09:00:00.000Z',
      updated_at: new Date(now.getTime() - Math.random() * 24 * 3600 * 1000).toISOString(),
    };

    // History record: Intake
    holderHistory.push({
      id: historyIdCounter.val++,
      gb_no: gbNo,
      from_holder_id: null,
      to_holder_id: owner.id,
      from_stage: null,
      to_stage: 'IAD',
      changed_by: owner.id,
      note: 'Initial bill physical receipt and GB entry',
      changed_at: recdDateStr + 'T09:05:00.000Z'
    });

    if (currentHolder.id !== owner.id) {
      holderHistory.push({
        id: historyIdCounter.val++,
        gb_no: gbNo,
        from_holder_id: owner.id,
        to_holder_id: currentHolder.id,
        from_stage: 'IAD',
        to_stage: currentStage,
        changed_by: owner.id,
        note: `Handover from ${owner.full_name} to ${currentHolder.full_name} for verification`,
        changed_at: new Date(new Date(recdDateStr).getTime() + 24 * 3600 * 1000).toISOString()
      });
    }

    // Alerts for A-3, A-5, A-10
    if (ageDays >= 10 && dfrStatus !== 'PAID' && dfrStatus !== 'CLOSED') {
      alerts.push({
        id: alertIdCounter.val++,
        gb_no: gbNo,
        band: 'A-10',
        raised_at: new Date(new Date(recdDateStr).getTime() + 10 * 24 * 3600 * 1000).toISOString(),
        acknowledged_by: i % 2 === 0 ? 'user-006' : undefined,
        acknowledged_at: i % 2 === 0 ? new Date().toISOString() : undefined,
      });
    } else if (ageDays >= 5 && dfrStatus !== 'PAID' && dfrStatus !== 'CLOSED') {
      alerts.push({
        id: alertIdCounter.val++,
        gb_no: gbNo,
        band: 'A-5',
        raised_at: new Date(new Date(recdDateStr).getTime() + 5 * 24 * 3600 * 1000).toISOString(),
      });
    }

    // Multi-labels assignment
    const labelIds: string[] = [];
    if (i % 6 === 0) labelIds.push('lbl-001'); // Urgent
    if (i % 8 === 0) labelIds.push('lbl-002'); // VIP Supplier
    if (i % 11 === 0) labelIds.push('lbl-003'); // Query Raised
    if (i % 9 === 0) labelIds.push('lbl-004'); // Discount Eligible
    if (labelIds.length > 0) {
      billLabelsMap[gbNo] = labelIds;
    }

    erpBills.push(erpBill);
    dfrBills.push(dfrBill);
  }

  return { erpBills, dfrBills, holderHistory, alerts, billLabelsMap };
}
