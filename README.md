This is the Merito marketing site built with [Next.js](https://nextjs.org).

## Environment Setup

Copy `.env.example` to `.env.local` for local development and add the same values in Vercel for production.

```bash
copy .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SITE_URL`: public site origin. Production should be `https://www.merito.in`.
- `NEXT_PUBLIC_ENV`: set to `production` or `staging`.
- `RESEND_API_KEY`: API key from your Resend account.
- `CONTACT_FROM_EMAIL`: verified sender in Resend, for example `noreply@merito.in`.
- `CONTACT_TO_EMAIL`: destination inbox for contact submissions. Multiple recipients can be comma-separated.

## Contact Form

The contact form posts to `POST /api/contact` and sends email through Resend. Before deploying, make sure:

1. Your sending domain or sender address is verified in Resend.
2. `CONTACT_FROM_EMAIL` matches that verified sender.
3. `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, and `NEXT_PUBLIC_SITE_URL` are set in Vercel.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
