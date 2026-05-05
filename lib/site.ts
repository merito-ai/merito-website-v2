export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.merito.in";

export function getAbsoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}