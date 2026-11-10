"""Golden fixtures for the TS psychometrics port: runs the REAL Django scoring.py.

Usage (from repo root):
  python -I scripts/psychometrics/gen_golden.py D:/Work-Projects/staff-assessment-platform/backend lib/psychometrics/__tests__/golden.json
"""
import json, random, sys, types
from types import SimpleNamespace as NS

sys.path.insert(0, sys.argv[1])


class _Mgr:
    def __init__(self, n): self.n = n
    def count(self): return self.n
    def filter(self, **kw): return self


stub = types.ModuleType("apps.psychometrics.models")
stub.PersonalityStatement = NS(objects=_Mgr(60))
stub.PersonalityValidityStatement = NS(objects=_Mgr(5))
stub.CultureStatement = NS(objects=_Mgr(3))  # only used as filter(is_attention_check=True).count()
sys.modules["apps.psychometrics.models"] = stub

from apps.psychometrics.seed_data import PERSONALITY_ITEMS, PERSONALITY_IM, PERSONALITY_PAIRS, CULTURE_ITEMS  # noqa: E402
from apps.psychometrics.scoring import score_personality, score_culture  # noqa: E402


class _Rel(list):
    def select_related(self, *a): return self


def p_attempt(answers):
    rs = []
    for order, it in enumerate(PERSONALITY_ITEMS, start=1):  # order = seed order, as the seed command sets it
        v = answers.get(str(it["id"]))
        if v is None: continue
        st = NS(trait=it["trait"], reverse_keyed=it["reverse_keyed"], order=order)
        rs.append(NS(statement_id=it["id"], statement=st, validity_statement_id=None, value=v))
    for it in PERSONALITY_IM:
        v = answers.get(str(it["id"]))
        if v is None: continue
        rs.append(NS(statement_id=None, statement=None, validity_statement_id=it["id"], value=v))
    return NS(responses=_Rel(rs))


def c_attempt(answers):
    rs = []
    for it in CULTURE_ITEMS:
        v = answers.get(it["id"])
        if v is None: continue
        st = NS(culture=it["culture"], reverse_keyed=it["reverse_keyed"],
                is_attention_check=it["is_attention_check"], attention_direction=it["attention_direction"])
        rs.append(NS(statement=st, value=v))
    return NS(responses=_Rel(rs))


P_IDS = [str(i["id"]) for i in PERSONALITY_ITEMS] + [str(i["id"]) for i in PERSONALITY_IM]
C_IDS = [i["id"] for i in CULTURE_ITEMS]


def p_cases():
    r = random.Random(42)
    yield "all-1", {k: 1 for k in P_IDS}
    yield "all-5", {k: 5 for k in P_IDS}
    yield "all-3", {k: 3 for k in P_IDS}
    yield "im-high", {**{k: r.randint(1, 5) for k in P_IDS}, **{str(i["id"]): 5 for i in PERSONALITY_IM}}
    for n in range(25):
        yield f"random-{n}", {k: r.randint(1, 5) for k in P_IDS}
    for n in range(10):
        a = {k: r.randint(1, 5) for k in P_IDS}
        for k in r.sample(P_IDS, r.randint(5, 40)): a.pop(k)
        yield f"partial-{n}", a


def c_cases():
    r = random.Random(7)
    yield "all-1", {k: 1 for k in C_IDS}
    yield "all-7", {k: 7 for k in C_IDS}
    yield "attn-pass", {**{k: r.randint(1, 7) for k in C_IDS}, "attn1": 1, "attn2": 2, "attn3": 7}
    yield "attn-fail-low", {**{k: r.randint(1, 7) for k in C_IDS}, "attn1": 6, "attn2": 1, "attn3": 7}
    yield "attn-fail-high", {**{k: r.randint(1, 7) for k in C_IDS}, "attn1": 1, "attn2": 1, "attn3": 2}
    a = {k: r.randint(1, 7) for k in C_IDS}; a.pop("attn2"); a["attn1"] = 1; a["attn3"] = 7
    yield "attn-skipped", a
    for n in range(25):
        yield f"random-{n}", {k: r.randint(1, 7) for k in C_IDS}
    for n in range(10):
        a = {k: r.randint(1, 7) for k in C_IDS}
        for k in r.sample(C_IDS, r.randint(3, 20)): a.pop(k)
        yield f"partial-{n}", a


out = {
    "items": {"personality": PERSONALITY_ITEMS, "im": PERSONALITY_IM, "pairs": PERSONALITY_PAIRS, "culture": CULTURE_ITEMS},
    "personality": [{"name": n, "answers": a, "expected": score_personality(p_attempt(a))} for n, a in p_cases()],
    "culture": [{"name": n, "answers": a, "expected": score_culture(c_attempt(a))} for n, a in c_cases()],
}
with open(sys.argv[2], "w", encoding="utf-8") as f:
    json.dump(out, f, indent=1, ensure_ascii=False)
print("ok", len(out["personality"]), len(out["culture"]))
