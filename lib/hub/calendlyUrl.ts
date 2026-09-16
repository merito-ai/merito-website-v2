// Single source for the counselling-call booking link, was duplicated
// verbatim in CounsellingCard.tsx and ExpertBookingButton.tsx. Falls back to
// the existing hardcoded link so prod behavior is unchanged if the env var
// is never set.
export const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/rhumbe-merito/30min";
