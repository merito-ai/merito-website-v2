// Recruiter preview depends on the browser extension, which scrapes LinkedIn
// and got a test account banned. Off by default until the extension is safe:
// the nav item shows as "Coming soon", its pages redirect, and its APIs 404.
export const RECRUITER_PREVIEW_ENABLED = process.env.NEXT_PUBLIC_RECRUITER_PREVIEW_ENABLED === "true";
