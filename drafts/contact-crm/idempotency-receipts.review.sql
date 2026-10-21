-- DRAFT REVIEW ONLY. DO NOT RUN IN PRODUCTION WITHOUT APPROVAL.
-- Durable idempotency receipts for verified Netlify submissions.
-- One receipt per external submission; one lead per receipt.
-- The intake worker must use ONE database transaction for lead insertion and
-- receipt insertion, guarded by a transaction-scoped advisory lock keyed from
-- the verified submission ID. The UNIQUE constraints are the final safeguard.
--
-- Important: this table alone DOES NOT provide atomicity across independent
-- Supabase REST calls. A single multi-statement SQL transaction in trusted
-- backend code (or a separately reviewed restricted RPC) is required.
--
-- No public / anon / authenticated database grants are added.

begin;

create schema if not exists private;

create table if not exists private.netlify_contact_receipts (
  external_submission_id text primary key,
  lead_id bigint not null unique references public.leads(id) on delete restrict,
  received_at timestamptz not null default now(),
  constraint contact_receipt_id_length check (
    length(external_submission_id) between 6 and 128
  )
);

revoke all on schema private from public, anon, authenticated;
revoke all on table private.netlify_contact_receipts from public, anon, authenticated;
grant usage on schema private to service_role;
grant select, insert on private.netlify_contact_receipts to service_role;

alter table private.netlify_contact_receipts enable row level security;

commit;

-- Required transaction behavior (pseudocode, NOT executable SQL):
-- BEGIN
-- acquire transaction-scoped advisory lock(hash of authenticated submission ID)
-- SELECT lead_id from private.netlify_contact_receipts where external_submission_id=$id
-- if found: COMMIT; return existing lead ID, do not insert duplicate
-- INSERT public.leads (full_name,email,phone,service,company,status,notes)
-- VALUES (validated field values...) RETURNING id
-- INSERT private.netlify_contact_receipts (external_submission_id,lead_id)
-- VALUES ($id,$new_lead_id)
-- COMMIT
-- A failed receipt insertion must roll back lead creation.
--
-- A production migration should be reviewed for the project's existing
-- private-schema ownership, grants, and migration conventions first.
