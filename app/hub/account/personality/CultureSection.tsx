import { CULTURES } from "@/lib/psychometrics/cultureItems";
import type { CultureScores } from "@/lib/psychometrics/scoring";
import { cultureFit, type Fit } from "@/lib/psychometrics/cultureFit";
import { CULTURE_LABEL, CULTURE_MEANING, CULTURE_CAVEATS, FLAT_TEXT, UNRELIABLE_TEXT } from "@/lib/psychometrics/reportCopy";

// Culture mix + suitable organisation types + caveats. Shared by the dark Hub report and the
// light print/PDF page (`light`). Top 3 fits as cards; the rest collapse on web and list compactly
// in the PDF (no <details> there). Research basis lines stay in the web expansion only.
export default function CultureSection({ scores, reliable, light = false }: { scores: CultureScores; reliable: boolean | null; light?: boolean }) {
  const fit = cultureFit(scores, reliable);
  const c = light
    ? { card: { background: "#fff", border: "1px solid #F1E3E5" }, title: "#111827", body: "#4B5563", muted: "#6B7280", track: "#E5E7EB", accent: "#EC1B25", tile: "#FDF6F7" }
    : { card: { background: "rgb(29,25,31)", border: "1px solid rgb(49,47,55)" }, title: "#fff", body: "rgba(255,255,255,0.65)", muted: "rgba(255,255,255,0.4)", track: "rgba(255,255,255,0.08)", accent: "#ed1a24", tile: "rgba(255,255,255,0.04)" };
  const font = "font-[family-name:var(--font-poppins)]";
  const label = (text: string) => (
    <p className={`${font} font-bold uppercase`} style={{ fontSize: 11, letterSpacing: "0.04em", margin: "0 0 12px", color: c.accent }}>
      {text}
    </p>
  );
  const bar = (pct: number, h = 8) => (
    <div style={{ height: h, borderRadius: 6, overflow: "hidden", background: c.track }} aria-hidden="true">
      <div style={{ height: "100%", borderRadius: 6, width: `${Math.min(100, Math.max(0, pct))}%`, background: c.accent }} />
    </div>
  );
  const fitCard = (f: Fit, rank: number) => (
    <li key={f.key} style={{ background: c.tile, borderRadius: 12, padding: "12px 14px", border: rank === 0 ? `1px solid ${c.accent}` : "1px solid transparent" }}>
      <div className="flex items-baseline justify-between" style={{ gap: 10, marginBottom: 6 }}>
        <span className={`${font} font-semibold`} style={{ fontSize: 13.5, color: c.title }}>
          {f.label}
        </span>
        <span className={`${font} font-bold`} style={{ fontSize: 14, color: c.accent, whiteSpace: "nowrap" }}>
          {f.fit}%
        </span>
      </div>
      {bar(f.fit, 6)}
    </li>
  );
  const restRow = (f: Fit, withBasis: boolean) => (
    <li key={f.key} style={{ padding: "6px 0", borderTop: `1px solid ${c.track}` }}>
      <div className="flex items-baseline justify-between" style={{ gap: 10 }}>
        <span className={font} style={{ fontSize: 13, color: c.body }}>{f.label}</span>
        <span className={`${font} font-semibold`} style={{ fontSize: 12.5, color: c.muted, whiteSpace: "nowrap" }}>{f.fit}%</span>
      </div>
      {withBasis && <span className={font} style={{ display: "block", fontSize: 11.5, color: c.muted }}>Source: {f.basis}</span>}
    </li>
  );
  const ranked = [...CULTURES].sort((a, b) => scores[b] - scores[a]);

  return (
    <div style={{ ...c.card, borderRadius: 14, padding: 22, marginTop: 16, breakInside: "avoid" }}>
      <h2 className="font-[family-name:var(--font-gabarito)] font-semibold" style={{ fontSize: "1.15rem", margin: "0 0 4px", color: c.title }}>
        Work culture preferences
      </h2>
      <p className={font} style={{ fontSize: 12.5, margin: "0 0 20px", color: c.muted }}>
        The kind of workplace you said you prefer, and organisation types that typically match it.
      </p>

      <div className={light ? "grid grid-cols-2" : "grid grid-cols-1 md:grid-cols-2"} style={{ gap: 28 }}>
        <div>
          {label("Your culture mix")}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ranked.map((k) => {
              const pct = Math.round(scores[k]);
              return (
                <div key={k}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
                    <span className={`${font} font-semibold`} style={{ fontSize: 13.5, color: c.title }}>{CULTURE_LABEL[k]}</span>
                    <span className={`${font} font-semibold`} style={{ fontSize: 12.5, color: c.accent }}>{pct}/100</span>
                  </div>
                  {bar(pct)}
                  <p className={font} style={{ fontSize: 12, lineHeight: 1.5, margin: "5px 0 0", color: c.body }}>{CULTURE_MEANING[k]}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          {label("Organisation types that fit")}
          {fit.kind === "flat" && <p className={font} style={{ fontSize: 14, margin: 0, color: c.title }}>{FLAT_TEXT}</p>}
          {fit.kind === "unreliable" && <p className={font} style={{ fontSize: 13, lineHeight: 1.55, margin: 0, color: c.body }}>{UNRELIABLE_TEXT}</p>}
          {fit.kind === "fit" && (
            <>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {fit.fits.slice(0, 3).map((f, i) => fitCard(f, i))}
              </ul>
              {light ? (
                <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>{fit.fits.slice(3).map((f) => restRow(f, false))}</ul>
              ) : (
                <details style={{ marginTop: 12 }}>
                  <summary className={font} style={{ fontSize: 12.5, cursor: "pointer", color: c.muted }}>
                    Show all 7 and sources
                  </summary>
                  <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>{fit.fits.map((f) => restRow(f, true))}</ul>
                </details>
              )}
              <p className={font} style={{ fontSize: 11.5, margin: "10px 0 0", color: c.muted }}>Fit % is a Merito estimate.</p>
            </>
          )}
        </div>
      </div>

      <p className={font} style={{ fontSize: 11.5, lineHeight: 1.55, margin: "18px 0 0", color: c.muted }}>
        <span className="font-semibold" style={{ color: c.body }}>Keep in mind: </span>
        {CULTURE_CAVEATS.join(" ")}
      </p>
    </div>
  );
}
