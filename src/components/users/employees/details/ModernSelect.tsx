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
      className="w-full bg-[#E7E5E4] shadow-[inset_2px_2px_4px_#C6C4C3,inset_-2px_-2px_4px_#ffffff] rounded-lg px-4 py-2.5 text-sm text-[#1E2938] focus-visible:shadow-[inset_2px_2px_4px_#C6C4C3,inset_-2px_-2px_4px_#ffffff,0_0_0_2px_#006666] outline-none transition-shadow appearance-none"
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