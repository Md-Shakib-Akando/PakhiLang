/** Joins class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Page-width wrapper. */
export const CONTAINER = "mx-auto w-full max-w-[1180px] px-4 md:px-6";

/** Vertical rhythm between landing-page sections. */
export const SECTION = "pt-20 md:pt-28";

/** Pink -> violet gradient text. */
export const GRADIENT_TEXT = "bg-linear-120 from-pink via-orchid to-periwinkle bg-clip-text text-transparent";

/** Same gradient as a background. */
export const GRADIENT_BG = "bg-linear-120 from-pink via-orchid to-periwinkle";

/** Gradient text whose colors slowly flow back and forth (used for the big headlines). */
export const GRADIENT_TEXT_ANIMATED =
  "animate-gradient-x bg-[linear-gradient(110deg,var(--color-pink),var(--color-orchid),var(--color-periwinkle),var(--color-orchid),var(--color-pink))] bg-size-[200%_auto] bg-clip-text text-transparent";

/**
 * Staggered scroll-reveal: items further along the list start their reveal a bit later.
 * Written out in full so Tailwind can find the classes.
 */
const REVEAL_STAGGER = [
  "reveal",
  "reveal [animation-range:entry_12%_cover_32%]",
  "reveal [animation-range:entry_19%_cover_36%]",
  "reveal [animation-range:entry_26%_cover_40%]",
];

export function reveal(index = 0): string {
  return REVEAL_STAGGER[index % REVEAL_STAGGER.length];
}

/** Hero entrance delays (page load, not scroll). */
export const ENTRANCE_DELAY = [
  "[animation-delay:0ms]",
  "[animation-delay:90ms]",
  "[animation-delay:180ms]",
  "[animation-delay:270ms]",
  "[animation-delay:360ms]",
  "[animation-delay:450ms]",
];

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "md" | "sm";

const BUTTON_BASE =
  "relative isolate inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap border font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0";

/** A diagonal light streak that sweeps across the button on hover. */
const SHINE =
  "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:-z-10 before:w-1/2 before:-translate-x-[150%] before:-skew-x-12 before:bg-linear-to-r before:from-transparent before:via-white/45 before:to-transparent before:transition-transform before:duration-700 before:ease-out hover:before:translate-x-[250%]";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: cn(
    "border-transparent bg-pink text-[#1b0710] shadow-[0_8px_30px_-10px_rgba(255,95,162,0.7)] hover:bg-[#ff78b2] hover:shadow-[0_14px_40px_-10px_rgba(255,95,162,0.8)]",
    SHINE
  ),
  secondary: "border-line-strong bg-surface-2 text-fg hover:border-white/25 hover:bg-white/10",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  md: "h-11 rounded-[10px] px-5 text-[15px]",
  sm: "h-9 rounded-lg px-3.5 text-sm",
};

/** Class names for a button (or a link that looks like one). */
export function button(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  return cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size]);
}
