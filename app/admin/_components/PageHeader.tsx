export default function PageHeader({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between" style={{ gap: 16, marginBottom: 24 }}>
      <div>
        <h2 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.4rem", margin: "0 0 4px" }}>
          {title}
        </h2>
        <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 13, margin: 0 }}>
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
