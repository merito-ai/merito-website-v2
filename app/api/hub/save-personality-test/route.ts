import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { getSupabaseServerClient } from "@/lib/supabase";
import { isProductUnlocked } from "@/lib/productUnlocks";
import { isCompleteAnswerSet, toStoredScores, toStoredValidity, type Answers } from "@/lib/personality";
import { scorePersonality, scoreCulture, type RawAnswers } from "@/lib/psychometrics/scoring";
import { CULTURE_ITEMS } from "@/lib/psychometrics/cultureItems";
import { arePaymentsBypassed } from "@/lib/paymentsBypass";
import { isPersonalityComplete } from "@/lib/psychometrics/testFlow";

export const runtime = "nodejs";

// Part 1 answers (item id -> 1-5) to stored scores, or null when invalid/incomplete.
function scorePart1(rawAnswers: Record<string, unknown>) {
  const answers: Answers = {};
  for (const [key, value] of Object.entries(rawAnswers)) {
    const id = Number(key);
    if (!Number.isInteger(id) || typeof value !== "number") return null;
    answers[id] = value;
  }
  if (!isCompleteAnswerSet(answers)) return null;
  const result = scorePersonality(answers as unknown as RawAnswers);
  if (!result.trait_scores) return null;
  return { answers, scores: toStoredScores(result.trait_scores, answers), validity: toStoredValidity(result.validity) };
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!arePaymentsBypassed() && !(await isProductUnlocked(user.id, "personality"))) {
    return Response.json(
      { error: "Payment required to unlock the personality test. Please pay first." },
      { status: 402 }
    );
  }

  let body: { roleTitle?: string; part?: string; answers?: Record<string, unknown>; personalityAnswers?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const roleTitle = typeof body.roleTitle === "string" ? body.roleTitle.trim() : "";
  if (!roleTitle) {
    return Response.json({ error: "roleTitle is required." }, { status: 400 });
  }

  // Part 1 = personality (60 IPIP + 5 IM, 1-5), part 2 = culture (36 CVF + 3 attention, 1-7).
  const part = body.part === "culture" ? "culture" : "personality"; // no part = old client = personality
  const rawAnswers = body.answers;
  if (!rawAnswers || typeof rawAnswers !== "object") {
    return Response.json({ error: "answers is required." }, { status: 400 });
  }

  const admin = getSupabaseServerClient();

  if (part === "personality") {
    const part1 = scorePart1(rawAnswers);
    if (!part1) {
      return Response.json({ error: "All statements must be answered with a 1-5 rating before scoring." }, { status: 400 });
    }
    const { answers, scores, validity } = part1;

    // Part 1 must not overwrite a finished result: only an incomplete v2 may be redone. A v1 result
    // is retaken by sending both parts with part 2 (personalityAnswers), so it stays until v2 is done.
    const { data: existing, error: existingError } = await admin
      .from("personality_tests")
      .select("version, culture_scores")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existingError) {
      console.error("personality_tests read failed", { user_id: user.id, error: existingError });
      return Response.json({ error: "Something went wrong saving your results. Please try again." }, { status: 500 });
    }
    if (isPersonalityComplete(existing)) {
      return Response.json({ error: "You have already completed this test." }, { status: 409 });
    }

    // Retaking part 1 starts a fresh v2 attempt, so any earlier culture part is cleared.
    const { error: upsertError } = await admin.from("personality_tests").upsert(
      {
        user_id: user.id,
        role_title: roleTitle,
        version: 2,
        scores,
        validity,
        answers,
        completed_at: new Date().toISOString(),
        culture_scores: null,
        culture_reliable: null,
        culture_answers: null,
        culture_completed_at: null,
      },
      { onConflict: "user_id" }
    );
    if (upsertError) {
      console.error("personality_tests upsert failed", { user_id: user.id, role_title: roleTitle, error: upsertError });
      return Response.json({ error: "Something went wrong saving your results. Please try again." }, { status: 500 });
    }
    return Response.json({ scores, validity });
  }

  const cultureIds = new Set(CULTURE_ITEMS.map((i) => i.id));
  const cultureAnswers: RawAnswers = {};
  for (const [key, value] of Object.entries(rawAnswers)) {
    if (!cultureIds.has(key) || typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 7) {
      return Response.json({ error: "answers must map culture item id to a 1-7 rating." }, { status: 400 });
    }
    cultureAnswers[key] = value;
  }
  if (Object.keys(cultureAnswers).length !== CULTURE_ITEMS.length) {
    return Response.json({ error: "All statements must be answered before scoring." }, { status: 400 });
  }

  const { data: row, error: readError } = await admin
    .from("personality_tests")
    .select("version")
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError) {
    console.error("personality_tests read failed", { user_id: user.id, error: readError });
    return Response.json({ error: "Something went wrong saving your results. Please try again." }, { status: 500 });
  }
  // Retake over an old v1 result: part 1 arrives here, so both parts replace v1 in one write.
  const part1 = row?.version === 1 && body.personalityAnswers && typeof body.personalityAnswers === "object" ? scorePart1(body.personalityAnswers) : null;
  if (!row || (row.version !== 2 && !part1)) {
    return Response.json({ error: "Finish part 1 first." }, { status: 409 });
  }

  const culture = scoreCulture(cultureAnswers);
  if (part1) {
    const { error: upsertError } = await admin.from("personality_tests").upsert(
      {
        user_id: user.id,
        role_title: roleTitle,
        version: 2,
        scores: part1.scores,
        validity: part1.validity,
        answers: part1.answers,
        completed_at: new Date().toISOString(),
        culture_scores: culture.culture_scores,
        culture_reliable: culture.reliable,
        culture_answers: cultureAnswers,
        culture_completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (upsertError) {
      console.error("personality_tests v1 retake upsert failed", { user_id: user.id, error: upsertError });
      return Response.json({ error: "Something went wrong saving your results. Please try again." }, { status: 500 });
    }
    return Response.json({
      scores: part1.scores,
      validity: part1.validity,
      culture: { scores: culture.culture_scores, reliable: culture.reliable },
    });
  }
  const { error: updateError } = await admin
    .from("personality_tests")
    .update({
      culture_scores: culture.culture_scores,
      culture_reliable: culture.reliable,
      culture_answers: cultureAnswers,
      culture_completed_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
  if (updateError) {
    console.error("personality_tests culture update failed", { user_id: user.id, error: updateError });
    return Response.json({ error: "Something went wrong saving your results. Please try again." }, { status: 500 });
  }
  return Response.json({ culture: { scores: culture.culture_scores, reliable: culture.reliable } });
}
