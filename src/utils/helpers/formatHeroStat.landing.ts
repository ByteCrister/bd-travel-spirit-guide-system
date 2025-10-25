export default function formatHeroStat(value: number, options?: { suffix?: string; prefix?: string }) {
    let displayValue = value;
    let autoSuffix = "";

    if (value >= 1_000_000) {
        displayValue = value / 1_000_000;
        autoSuffix = "M+";
    } else if (value >= 1_000) {
        displayValue = value / 1_000;
        autoSuffix = "k+";
    } else {
        autoSuffix = "+";
    }

    return {
        displayValue,
        prefix: options?.prefix ?? "",
        suffix: options?.suffix ?? autoSuffix,
    };
}
