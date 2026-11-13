// `next` is attacker-controlled and ends up in a redirect Location header: only same-origin
// /hub/account or /admin paths pass. Checked raw and once-decoded so encoded tricks (%2F%2F, %5C) fail too.
const ALLOWED = /^\/(hub\/account|admin)(?=$|[/?#])/;
const BAD = /[\\\x00-\x1f\x7f]|\/\/|\.\./;

export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || next.length > 512) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(next);
  } catch {
    return null;
  }
  return [next, decoded].every((s) => ALLOWED.test(s) && !BAD.test(s)) ? next : null;
}
