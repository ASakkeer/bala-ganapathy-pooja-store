import { cn } from "@/lib/cn";

const variants = {
  primary:
    "rounded-full bg-brand text-on-brand hover:bg-brand-hover shadow-[0_10px_24px_rgb(91_7_25_/_0.18)]",
  secondary:
    "rounded-full bg-transparent text-brand ring-1 ring-brand/20 hover:bg-brand/5",
  ghost: "rounded-full text-brand hover:bg-brand/5",
  inverse: "rounded-full bg-on-brand text-brand hover:bg-surface-container-high",
  danger: "rounded-full bg-danger text-on-brand hover:bg-[#7e1625] shadow-[0_10px_24px_rgb(155_27_46_/_0.18)]",
  whatsapp: "rounded-full bg-[#128C7E] text-on-brand hover:bg-[#0f7468] shadow-[0_10px_24px_rgb(18_140_126_/_0.22)]",
  surface:
    "rounded-lg bg-surface-container text-on-surface hover:bg-primary hover:text-on-primary",
} as const;

export function buttonClassName(
  variant: keyof typeof variants = "primary",
  className?: string,
) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 px-5 text-sm font-medium tracking-wide transition-all duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    className,
  );
}

export type ButtonProps = React.ComponentProps<"button"> & {
  variant?: keyof typeof variants;
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}
