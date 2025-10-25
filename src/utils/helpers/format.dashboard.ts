// utils/format.ts
export function formatNumber(value: number, currency?: string, precision = 0) {
    try {
        if (currency) {
            return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: precision }).format(value);
        }
        return new Intl.NumberFormat(undefined, { maximumFractionDigits: precision }).format(value);
    } catch {
        return String(value);
    }
}

export function formatRelativeDate(iso: string) {
    const date = new Date(iso);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
}

export function formatPercent(value: number | undefined) {
    if (value === undefined || Number.isNaN(value)) return undefined;
    const sign = value > 0 ? "+" : "";
    return `${sign}${Number(value).toFixed(1)}%`;
}
