// components/ui/InfoCard.tsx
export default function InfoCard({
  icon: Icon,
  title,
  children,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[#E7E5E4] rounded-2xl shadow-[8px_8px_16px_#C6C4C3,-8px_-8px_16px_#ffffff] overflow-hidden ${className}`}
    >
      <div className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#E7E5E4] rounded-lg shadow-[4px_4px_8px_#C6C4C3,-4px_-4px_8px_#ffffff]">
            <Icon className="h-5 w-5 text-[#006666]" />
          </div>
          <h3
            className="text-lg font-semibold text-[#1E2938]"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            {title}
          </h3>
        </div>
      </div>
      <div className="p-6 pt-0">{children}</div>
    </div>
  );
}