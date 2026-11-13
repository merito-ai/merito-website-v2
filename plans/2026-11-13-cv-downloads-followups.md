# CV + report downloads: follow-ups

Built on `feat/cv-downloads` (migration 0074). Nice-to-haves, not blockers:

- "Download my CV" / "Download CV" links always show; a lead with no stored file and no `resume_text` answers 404 JSON. Could hide the link when neither exists.
- CVs from signed-out fitment checks are stored under `anon/{leadId}/`. Access and purge go by `fitment_leads.cv_path`, so this is safe, but the prefix does not name the owner.
- Fitment-check E2E with the real IntervueBox chain not run locally (no vendor key); the storage step was exercised with the same service-client calls.
- Candidate purge CV removal is unit-tested only (running the cron locally would purge other QA users' due rows).
- Older CV files cannot be recovered from IntervueBox (no download call in their API we know of).
