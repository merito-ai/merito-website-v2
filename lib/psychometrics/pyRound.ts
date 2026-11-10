// Python's round(): rounds the exact binary value, ties to even. JS toFixed() rounds the exact
// value too but sends ties up, so detect exact ties from the full decimal expansion first.
// toFixed(100) is exact for every double this code sees (scores in [0, 100]).
export function pyRound(x: number, ndigits = 0): number {
  if (x < 0) return -pyRound(-x, ndigits);
  const [int, frac = ""] = x.toFixed(100).split(".");
  if (/^50*$/.test(frac.slice(ndigits))) {
    let n = Number(int + frac.slice(0, ndigits));
    if (n % 2 === 1) n += 1;
    return n / 10 ** ndigits;
  }
  return Number(x.toFixed(ndigits));
}
