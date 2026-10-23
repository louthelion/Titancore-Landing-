-- REVIEW ONLY: NOT APPLIED TO TITANCORE PRODUCTION.
-- Receipt storage for Nuvexa IQ audit events. No client-side permissions.
create table if not exists public.nuvexa_audit_receipts (
  id uuid primary key default gen_random_uuid(),
  source_project text not null check (source_project = 'szhrslrofqpvjubhvfea'),
  source_event_id uuid not null,
  source_event_type text not null check (char_length(source_event_type) between 1 and 100),
  report_kind text not null check (report_kind in ('audit-test', 'audit-operational')),
  source_created_at timestamptz not null,
  received_at timestamptz not null default now(),
  source_payload_sha256 text not null check (source_payload_sha256 ~ '^[0-9a-f]{64}$'),
  receipt_status text not null default 'received' check (receipt_status = 'received'),
  constraint nuvexa_audit_receipts_source_unique unique (source_project, source_event_id)
);
alter table public.nuvexa_audit_receipts enable row level security;
revoke all on public.nuvexa_audit_receipts from anon, authenticated;
-- Do not grant inserts to browser roles. A narrowly scoped server identity
-- and authenticated receiver are required before enabling deliveries.
comment on table public.nuvexa_audit_receipts is
  'Private draft receipt ledger. A receipt signifies committed ingestion, not verified broker fills or financial performance.';
