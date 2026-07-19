// components/ui/ModernSelect.tsx
export default function ModernSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | "";
  onChange: (v: T) => void;
  options: readonly T[] | T[];
}) {
  return (
    <select
      className="w-full bg-[#E7E5E4]  rounded-lg px-4 py-2.5 text-sm text-[#1E2938] focus-visible: outline-none transition-shadow appearance-none"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value as T)}
      style={{ fontFamily: "var(--font-space-mono)" }}
    >
      <option value="" disabled>
        Select an option…
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}