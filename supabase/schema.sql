-- DFR (Document/Bill Flow Register) - Master Database Migration Schema
-- Target: Supabase / PostgreSQL 15+
-- Strictly separates ERP read-only mirror data from DFR operational tracking

create schema if not exists erp;
create schema if not exists dfr;

-- ============================================================================
-- 1. SCHEMA ERP: Read-Only Mirror of Selsoft ERP Data
-- ============================================================================

create table erp.bills (
  erp_bill_ref        text primary key,        -- Selsoft's unique bill/DC identifier
  bill_dc_no          text,                     -- "BILL / DC NO" (or MEMO)
  bill_date           date,
  party_name          text not null,
  amount              numeric(14,2) not null,
  category            text check (category in ('CASH BILL','CREDIT BILL')),
  prn                 text,
  quotation_ref       text,
  po_ref              text,
  material_inward_ref text,
  qc_approval_status  text,
  bill_inward_ref     text,
  grn_ref             text,
  bill_recd_date      date,                    -- Physical receipt date
  process_stage_raw   text,                    -- Raw stage from ERP
  tally_ref           text,                    -- Posted reference in Tally
  tally_posted_at     timestamptz,             -- Date & time posted to Tally
  payment_ref         text,
  payment_status      text check (payment_status in ('NOT_STARTED','PENDING','COMPLETED')),
  payment_completed_at timestamptz,
  last_synced_at      timestamptz not null default now(),
  raw_payload         jsonb                    -- Audit API payload
);

create index idx_erp_bills_party_name on erp.bills (party_name);
create index idx_erp_bills_last_synced on erp.bills (last_synced_at);
create index idx_erp_bills_tally_posted on erp.bills (tally_posted_at);

-- ============================================================================
-- 2. SCHEMA DFR: Internal Operational Tracking System
-- ============================================================================

create table dfr.users (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  role       text check (role in ('MD','MANAGER','STAFF','ACCOUNTS')),
  active     boolean not null default true
);

create table dfr.bills (
  gb_no             bigint generated always as identity primary key, -- "GB NO" serial
  erp_bill_ref      text not null references erp.bills(erp_bill_ref),
  owner_id          uuid not null references dfr.users(id),          -- Initial receiver (RP)
  current_holder_id uuid not null references dfr.users(id),          -- Current physical custodian
  current_stage     text not null check (current_stage in
                       ('IAD','AO','PURCHASE','JMD','ACCOUNTS','TALLY','PAYMENT')),
  dfr_status        text not null default 'OPEN'
                       check (dfr_status in ('OPEN','ON_HOLD','TALLY_DONE','PAID','CLOSED')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Handover Audit History (Written on every human checkpoint)
create table dfr.holder_history (
  id             bigint generated always as identity primary key,
  gb_no          bigint not null references dfr.bills(gb_no) on delete cascade,
  from_holder_id uuid references dfr.users(id),
  to_holder_id   uuid not null references dfr.users(id),
  from_stage     text,
  to_stage       text not null,
  changed_by     uuid not null references dfr.users(id),             -- Confirmed by user
  note           text,
  changed_at     timestamptz not null default now()
);

-- Multi-Label System
create table dfr.labels (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  color       text not null default '#0284c7',
  description text,
  created_at  timestamptz not null default now()
);

create table dfr.bill_labels (
  gb_no      bigint not null references dfr.bills(gb_no) on delete cascade,
  label_id   uuid not null references dfr.labels(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (gb_no, label_id)
);

-- Automated Ageing Alerts Log
create table dfr.alerts (
  id              bigint generated always as identity primary key,
  gb_no           bigint not null references dfr.bills(gb_no) on delete cascade,
  band            text not null check (band in ('A-3','A-5','A-10')),
  raised_at       timestamptz not null default now(),
  acknowledged_by uuid references dfr.users(id),
  acknowledged_at timestamptz
);

-- Sync Audit Errors Log
create table dfr.sync_errors (
  id            bigint generated always as identity primary key,
  raw_record    jsonb,
  error_message text not null,
  occurred_at   timestamptz not null default now()
);

-- ============================================================================
-- 3. DERIVED VIEW: dfr.bill_register
-- Calculates Overall Ageing, Tally Ageing, Age Bands, & Label Arrays dynamically
-- ============================================================================

create view dfr.bill_register as
select
  b.gb_no,
  b.erp_bill_ref,
  e.bill_dc_no,
  e.bill_date,
  e.party_name,
  e.amount,
  e.category,
  b.owner_id,
  u_owner.full_name                                                  as owner_name,
  b.current_holder_id,
  u_holder.full_name                                                 as current_holder_name,
  b.current_stage,
  b.dfr_status,
  coalesce(e.bill_recd_date, e.bill_date)                            as effective_recd_date,
  (current_date - coalesce(e.bill_recd_date, e.bill_date))            as age_days,
  case
    when (current_date - coalesce(e.bill_recd_date, e.bill_date)) >= 10 then 'A-10'
    when (current_date - coalesce(e.bill_recd_date, e.bill_date)) >= 5  then 'A-5'
    when (current_date - coalesce(e.bill_recd_date, e.bill_date)) >= 3  then 'A-3'
    else 'NORMAL'
  end                                                                   as age_band,
  e.tally_posted_at,
  case
    when e.tally_posted_at is not null then (current_date - e.tally_posted_at::date)
    else null
  end                                                                   as tally_age_days,
  e.tally_posted_at is not null                                         as moved_to_tally,
  e.payment_status,
  e.payment_completed_at,
  coalesce(
    (
      select jsonb_agg(jsonb_build_object('id', l.id, 'name', l.name, 'color', l.color))
      from dfr.bill_labels bl
      join dfr.labels l on l.id = bl.label_id
      where bl.gb_no = b.gb_no
    ),
    '[]'::jsonb
  )                                                                      as labels
from dfr.bills b
join erp.bills e on e.erp_bill_ref = b.erp_bill_ref
join dfr.users u_owner on u_owner.id = b.owner_id
join dfr.users u_holder on u_holder.id = b.current_holder_id;
