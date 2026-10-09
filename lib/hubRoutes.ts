// Routes that render without the marketing site's Navbar/Footer. The public
// sample report is a standalone document like the account print pages.
export function isHubAccountRoute(pathname: string): boolean {
  return pathname === "/hub/account" || pathname.startsWith("/hub/account/") || pathname === "/hub/sample-report";
}
