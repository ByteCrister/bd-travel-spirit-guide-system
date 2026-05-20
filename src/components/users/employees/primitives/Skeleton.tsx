// components/employees/primitives/Skeleton.tsx
export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`rounded-xl bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c9c7c5,inset_-2px_-2px_5px_#ffffff] animate-pulse ${className}`}
        />
    );
}