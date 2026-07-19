// components/employees/primitives/Skeleton.tsx
export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`rounded-xl bg-[#E7E5E4] border border-[#d0cecc] animate-pulse ${className}`}
        />
    );
}