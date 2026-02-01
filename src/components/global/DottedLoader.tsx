import { cn } from "@/lib/utils";

const DottedLoader = ({ className }: { className?: string }) => (
  <span className={cn("flex items-center gap-1", className)}>
    <span className="animate-bounce inline-block w-2 h-2 bg-emerald-600 rounded-full"></span>
    <span className="animate-bounce inline-block w-2 h-2 bg-emerald-600 rounded-full delay-150"></span>
    <span className="animate-bounce inline-block w-2 h-2 bg-emerald-600 rounded-full delay-300"></span>
  </span>
);

export default DottedLoader;