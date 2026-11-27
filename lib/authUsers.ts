import type { getSupabaseServerClient } from "@/lib/supabase";

// Login accounts. Plan buyers can sign up and pay before any role check, so they have no fitment_leads row.

type Db = ReturnType<typeof getSupabaseServerClient>;

export type AuthUser = {
  id: string;
  email?: string | null;
  created_at: string;
  last_sign_in_at?: string | null;
  banned_until?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

// Paginated sweep of every auth user.
export async function listAllAuthUsers(db: Db): Promise<AuthUser[]> {
  const out: AuthUser[] = [];
  const perPage = 1000;
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Failed to list users: ${error.message}`);
    const users = data?.users ?? [];
    out.push(...users);
    if (users.length < perPage) return out;
  }
}

// Fills missing entries of emailByUser with each user's login email.
export async function fillAuthEmails(db: Db, emailByUser: Map<string, string>, userIds: string[]): Promise<void> {
  const missing = [...new Set(userIds)].filter((id) => id && !emailByUser.has(id));
  const users = await Promise.all(missing.map((id) => db.auth.admin.getUserById(id).catch(() => null)));
  users.forEach((res, i) => {
    const email = res?.data?.user?.email;
    if (email) emailByUser.set(missing[i], email);
  });
}

export function authDisplayName(user: Pick<AuthUser, "user_metadata">): string | null {
  const meta = user.user_metadata as { full_name?: unknown; name?: unknown } | null | undefined;
  const name = typeof meta?.full_name === "string" ? meta.full_name : typeof meta?.name === "string" ? meta.name : null;
  return name?.trim() || null;
}
