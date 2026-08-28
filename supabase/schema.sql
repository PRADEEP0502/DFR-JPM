-- DFR (Document/Bill Flow Register) - Master Database Migration Schema
-- Target: Supabase / PostgreSQL 15+
-- Strictly separates Selsoft ERP read-only mirror data from DFR operational tracking

create schema if not exists erp;
create schema if not exists dfr;

-- ============================================================================
-- 1. SCHEMA ERP: Read-Only Mirror of Selsoft ERP Data (GetBillsInward API)
-- ============================================================================

create table erp.bills (
  header_id              bigint primary key,       -- Selsoft's unique HeaderId identifier
  br_no                  text not null,            -- "BR NO" Inward serial reference
  br_date                date not null,            -- Inward receipt date (used for Ageing!)
  category               text not null,            -- Category (e.g. CHEMICAL, STATIONARY, etc.)
  supplier               text not null,            -- Party / Vendor name
  bill_no                text not null,            -- Invoice / DC / Memo No
  bill_date              date not null,            -- Supplier invoice date
  amount                 numeric(14,2) not null,   -- Bill amount
  approval_status        text not null,            -- PENDING, APPROVED, REJECTED, etc.
  next_approver          text,                     -- Next designated approver/stage
  rejected_by            text,                     -- Rejection user name (if rejected)
  rejection_reason       text,                     -- Rejection remark (if rejected)
  tally_status           text,                     -- WAITING, EXPORTED, POSTED, etc.
  bill_status            text not null default 'OPEN', -- OPEN, PAID, CLOSED, CANCELLED
  tally_exported_date    timestamptz,              -- Export timestamp to Tally
  last_modified_datetime timestamptz not null default now(),
  raw_payload            jsonb                     -- Raw API payload for audit
);

create index idx_erp_bills_supplier on erp.bills (supplier);
create index idx_erp_bills_br_date on erp.bills (br_date);
create index idx_erp_bills_last_modified on erp.bills (last_modified_datetime);
create index idx_erp_bills_tally_status on erp.bills (tally_status);

-- ============================================================================
-- 2. SCHEMA DFR: Internal Operational Tracking System
-- ============================================================================

create table dfr.users (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  role       text check (role in ('MD','MANAGER','STAFF','ACCOUNTS')),
  active     boolean not null default true
);

create table dfr.bill_tracking (
  header_id         bigint primary key references erp.bills(header_id) on delete cascade,
  current_holder_id uuid not null references dfr.users(id),          -- Maintained exclusively by DFR
  current_stage     text not null check (current_stage in
                       ('BILL_INWARD','IAD','AO','JMD','ACCOUNTS','TALLY')),
  dfr_status        text not null default 'OPEN'
                       check (dfr_status in ('OPEN','ON_HOLD','TALLY_DONE','PAID','CLOSED')),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Handover Audit History (Written on every human checkpoint)
create table dfr.holder_history (
  id             bigint generated always as identity primary key,
  header_id      bigint not null references erp.bills(header_id) on delete cascade,
  from_holder_id uuid references dfr.users(id),
  to_holder_id   uuid not null references dfr.users(id),
  from_stage     text,
  to_stage       text not null,
  changed_by     uuid not null references dfr.users(id),             -- Confirmed by actor user
  note           text,
  changed_at     timestamptz not null default now()
);

-- Multi-Label Taxonomy System
create table dfr.labels (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  color       text not null default '#0284c7',
  description text,
  created_at  timestamptz not null default now()
);

create table dfr.bill_labels (
  header_id  bigint not null references erp.bills(header_id) on delete cascade,
  label_id   uuid not null references dfr.labels(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (header_id, label_id)
);

-- Automated Ageing Alerts Log (Calculated strictly from BRDate)
create table dfr.alerts (
  id              bigint generated always as identity primary key,
  header_id       bigint not null references erp.bills(header_id) on delete cascade,
  band            text not null check (band in ('A-3','A-5','A-10')),
  raised_at       timestamptz not null default now(),
  acknowledged_by uuid references dfr.users(id),
  acknowledged_at timestamptz
);

-- Sync Log & Errors Audit
create table dfr.sync_log (
  id             bigint generated always as identity primary key,
  sync_timestamp timestamptz not null default now(),
  records_synced int not null default 0,
  is_success     boolean not null default true,
  error_message  text
);

-- ============================================================================
-- 3. DERIVED VIEW: dfr.bill_register
-- Dynamically calculates Ageing from BRDate (current_date - br_date)
-- ============================================================================

create or replace view dfr.bill_register as
select
  e.header_id,
  e.br_no,
  e.br_date,
  e.bill_no,
  e.bill_date,
  e.supplier,
  e.amount,
  e.category,
  t.current_holder_id,
  u_holder.full_name                                                 as current_holder_name,
  t.current_stage,
  (current_date - e.br_date)                                         as age_days,
  case
    when (current_date - e.br_date) >= 10 then 'A-10'
    when (current_date - e.br_date) >= 5  then 'A-5'
    when (current_date - e.br_date) >= 3  then 'A-3'
    else 'NORMAL'
  end                                                                as age_band,
  e.approval_status,
  e.next_approver,
  e.rejected_by,
  e.rejection_reason,
  e.tally_status,
  e.tally_exported_date,
  e.bill_status,
  t.dfr_status,
  coalesce(
    (
      select jsonb_agg(jsonb_build_object('id', l.id, 'name', l.name, 'color', l.color))
      from dfr.bill_labels bl
      join dfr.labels l on l.id = bl.label_id
      where bl.header_id = e.header_id
    ),
    '[]'::jsonb
  )                                                                  as labels
from erp.bills e
left join dfr.bill_tracking t on t.header_id = e.header_id
left join dfr.users u_holder on u_holder.id = t.current_holder_id;
