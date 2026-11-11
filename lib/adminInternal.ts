// Internal/test accounts (team, QA) excluded from admin Home and Insights
// counts. ADMIN_INTERNAL_EMAILS is a comma list of emails and/or "@domain"
// entries, e.g. "@merito.in,qa.tester@gmail.com".
export function parseInternalList(raw: string = process.env.ADMIN_INTERNAL_EMAILS ?? ""): string[] {
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isInternalEmail(email: string | null | undefined, list: string[] = parseInternalList()): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  return list.some((entry) => (entry.startsWith("@") ? e.endsWith(entry) : e === entry));
}
