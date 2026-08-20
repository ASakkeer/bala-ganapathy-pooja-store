import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-brand text-on-brand hover:bg-brand-hover shadow-[0_10px_24px_rgb(122_31_43_/_0.18)]",
  secondary:
    "bg-transparent text-brand ring-1 ring-brand/20 hover:bg-brand/5",
  ghost: "text-brand hover:bg-brand/5",
  inverse: "bg-on-brand text-brand hover:bg-bg",
  danger: "bg-danger text-on-brand hover:bg-[#7e1625] shadow-[0_10px_24px_rgb(155_27_46_/_0.18)]",
  whatsapp: "bg-[#128C7E] text-on-brand hover:bg-[#0f7468] shadow-[0_10px_24px_rgb(18_140_126_/_0.22)]",
} as const;

export function buttonClassName(
  variant: keyof typeof variants = "primary",
  className?: string,
) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium tracking-wide transition-all duration-200",
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
