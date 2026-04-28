import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#fdf8fb] flex flex-col items-center justify-center gap-6 text-center px-5">
      <div className="w-[6px] h-[40px] bg-[#ed1a24] mx-auto" />
      <h1 className="font-[family-name:var(--font-poppins)] font-bold text-[64px] text-[#ed1a24]">404</h1>
      <p className="text-[20px] font-semibold text-black">Page not found</p>
      <p className="text-[16px] text-[#4b4b4d] max-w-[420px]">This page doesn't exist. Head back to explore Merito's platform.</p>
      <Link href="/" className="bg-[#ed1a24] text-white font-semibold px-8 py-3 rounded-[8px] hover:bg-[#c8151e] transition-colors">
        Back to Home
      </Link>
    </main>
  );
}
