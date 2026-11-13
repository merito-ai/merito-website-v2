-- 0074_candidate_cvs.sql
-- Keep the original CV file a candidate uploads in the fitment check, so the candidate and admins
-- can download it later. New uploads only; older leads fall back to fitment_leads.resume_text.
-- Idempotent: applied by hand in the SQL editor + `supabase migration repair --status applied 0074`.

-- Private bucket. No storage.objects policies on purpose: only the server's service-role client
-- reads/writes it, and downloads go through short-lived signed URLs after an owner/admin check.
insert into storage.buckets (id, name, public)
values ('candidate-cvs', 'candidate-cvs', false)
on conflict (id) do nothing;

alter table fitment_leads add column if not exists cv_path text;
alter table fitment_leads add column if not exists cv_filename text;
alter table fitment_leads add column if not exists cv_mime text;
