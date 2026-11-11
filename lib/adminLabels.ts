// Human-readable labels for admin log rows (audit log, recruiter log,
// pipeline failures) so the admin never reads raw JSON or internal keys.

function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "candidate.fitment_override" -> "Candidate fitment override" */
export function formatActionLabel(action: string): string {
  return sentenceCase(action.split(/[._]/).join(" "));
}

/** "overallScore" / "role_title" -> "Overall score" / "Role title" */
export function formatKey(key: string): string {
  return sentenceCase(key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").split("_").join(" ").toLowerCase());
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function formatValue(value: unknown): string {
  if (value == null || value === "") return "none";
  if (Array.isArray(value)) return value.length === 0 ? "none" : value.map(formatValue).join(", ");
  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) return "none";
    return entries.map(([k, v]) => `${formatKey(k)}: ${formatValue(v)}`).join("; ");
  }
  const text = String(value);
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

/** Shows only the fields that changed when both sides are objects. */
export function formatChange(priorValue: unknown, newValue: unknown): string {
  if (priorValue == null) return formatValue(newValue);
  if (isPlainObject(priorValue) && isPlainObject(newValue)) {
    const keys = Array.from(new Set([...Object.keys(priorValue), ...Object.keys(newValue)]));
    const changed = keys.filter((k) => JSON.stringify(priorValue[k]) !== JSON.stringify(newValue[k]));
    if (changed.length === 0) return formatValue(newValue);
    return changed.map((k) => `${formatKey(k)}: ${formatValue(priorValue[k])} → ${formatValue(newValue[k])}`).join("; ");
  }
  return `${formatValue(priorValue)} → ${formatValue(newValue)}`;
}

/** "candidate", "abc" -> "Candidate abc" (short id, full id stays in the link). */
export function formatTarget(targetType: string, targetId: string): string {
  const shortId = /^[0-9a-f-]{36}$/i.test(targetId) ? targetId.slice(0, 8) : targetId;
  return `${formatKey(targetType)} ${shortId}`;
}
