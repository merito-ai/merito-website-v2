// Single source for the counselling-call booking link, was duplicated
// verbatim in CounsellingCard.tsx and ExpertBookingButton.tsx. Falls back to
// the existing hardcoded link so prod behavior is unchanged if the env var
// is never set.
export const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/rhumbe-merito/30min";

// Prefills Calendly's name/email fields so a paid user doesn't retype them.
// The booking window itself (48h) is set on the Calendly event type, not here.
export function buildCalendlyUrl({ name, email }: { name?: string; email?: string }): string {
  const url = new URL(CALENDLY_URL);
  if (name) url.searchParams.set("name", name);
  if (email) url.searchParams.set("email", email);
  return url.toString();
}
