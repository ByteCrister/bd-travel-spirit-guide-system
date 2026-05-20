import { cn } from "@/lib/utils";

const DottedLoader = ({ className }: { className?: string }) => (
    <span className={cn("flex items-center gap-1.5", className)}>
        {[0, 150, 300].map((delay) => (
            <span
                key={delay}
                className="animate-bounce inline-block w-2 h-2 rounded-full"
                style={{
                    animationDelay: `${delay}ms`,
                    background: "#006666",
                    boxShadow:
                        "2px 2px 4px rgba(0,0,0,0.18), -1px -1px 3px rgba(255,255,255,0.55)",
                }}
            />
        ))}
    </span>
);

export default DottedLoader;