import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { restartReferenceCheck } from "@/lib/referenceChecks";
import { isProductUnlocked } from "@/lib/productUnlocks";
import { arePaymentsBypassed } from "@/lib/paymentsBypass";

export async function POST(_request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!arePaymentsBypassed() && !(await isProductUnlocked(user.id, "references"))) {
    return Response.json(
      { error: "Payment required to unlock reference checks. Please pay first." },
      { status: 402 }
    );
  }

  try {
    const { id } = await restartReferenceCheck(user.id);
    return Response.json({ checkId: id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CHECK") {
      return Response.json({ error: "No reference check to restart yet." }, { status: 409 });
    }
    return Response.json({ error: "Something went wrong restarting your reference check." }, { status: 500 });
  }
}
