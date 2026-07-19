/**
 * src/styles/neu.styles.ts
 * ─────────────────────────────────────────────────────────────
 * Design-System — reusable Tailwind class tokens.
 *
 * Brand palette (use via arbitrary-value Tailwind classes):
 *   primary  #006666   teal
 *   surface  #E7E5E4   warm-stone
 *   text     #1E2938   deep-navy
 *   success  #00A63D
 *   warning  #FE9900
 *   danger   #FF2157
 *   secondary #F1F2F5
 *
 * Fonts (must be applied on <body> / layout root):
 *   --font-space-mono    → headings, labels, brand
 *   --font-jetbrains-mono → data, code, secondary text
 */

// ── Surface ──────────────────────────────────────────────────
export const NEU_SURFACE = "bg-[#E7E5E4]";
export const NEU_SURFACE_RAISED = "bg-[#E7E5E4]";
export const NEU_SURFACE_INSET = "bg-[#E7E5E4]";
export const NEU_SURFACE_INSET_SM = "bg-[#E7E5E4]";

// ── Cards ─────────────────────────────────────────────────────
export const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] border border-[#d0cecc]";
export const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] border border-[#d0cecc]";
export const NEU_CARD_HOVER =
  "hover:-translate-y-0.5 transition-all duration-300";

// ── Buttons ───────────────────────────────────────────────────
export const NEU_BTN_PRIMARY =
  "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-700 tracking-wide " +
  "hover:bg-[#007777] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";

export const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
  "border border-[#d0cecc] hover:bg-[#dbd9d8] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

export const NEU_BTN_DANGER =
  "rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] " +
  "border border-[#d0cecc] hover:bg-[#FF2157]/10 " +
  "transition-all duration-200";

export const NEU_BTN_ICON =
  "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  "border border-[#d0cecc] hover:text-[#006666] hover:bg-[#dbd9d8] " +
  "disabled:opacity-40 disabled:cursor-not-allowed " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

export const NEU_BTN_ICON_ACTIVE =
  "rounded-xl w-9 h-9 flex items-center justify-center bg-[#006666] text-white";

// ── Inputs ────────────────────────────────────────────────────
export const NEU_INPUT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "border border-[#d0cecc] " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

// ── Badges ────────────────────────────────────────────────────
export const NEU_BADGE =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 " +
  "bg-[#E7E5E4] text-[#1E2938] border border-[#d0cecc]";

export const NEU_BADGE_PRIMARY =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 " +
  "bg-[#006666]/10 text-[#006666]";

export const NEU_BADGE_SUCCESS =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 " +
  "bg-[#00A63D]/10 text-[#00A63D]";

export const NEU_BADGE_WARNING =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 " +
  "bg-[#FE9900]/10 text-[#FE9900]";

export const NEU_BADGE_DANGER =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 " +
  "bg-[#FF2157]/10 text-[#FF2157]";

// ── Typography ────────────────────────────────────────────────
export const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
export const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
export const NEU_MONO =
  "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
export const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

// ── Icon well ─────────────────────────────────────────────────
export const NEU_ICON_WELL =
  "p-2.5 rounded-xl bg-[#E7E5E4] border border-[#d0cecc]";
export const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10";

// ── Divider ───────────────────────────────────────────────────
export const NEU_DIVIDER = "border-[#1E2938]/10";

// ── Skeleton pulse ────────────────────────────────────────────
export const NEU_SKELETON =
  "rounded-lg bg-[#d0cecd] animate-pulse";

// ── Page bg ───────────────────────────────────────────────────
export const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";