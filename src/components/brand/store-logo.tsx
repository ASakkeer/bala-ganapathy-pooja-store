import { STORE_FOOTER_LOGO_SRC, STORE_LOGO_SRC, STORE_NAME } from "@/lib/constants";
import { cn } from "@/lib/cn";

const sizes = {
  header: "h-10 w-auto max-w-[11.5rem] sm:h-12 sm:max-w-[16rem] md:h-14 md:max-w-[18rem]",
  footer: "h-20 w-auto max-w-[16rem] sm:h-24 sm:max-w-[20rem] md:h-28 md:max-w-[24rem]",
  login: "h-14 w-auto max-w-[16rem]",
  admin: "h-10 w-auto max-w-[14rem]",
  page: "h-14 w-auto max-w-[16rem]",
} as const;

export function StoreLogo({
  size = "header",
  className,
  decorative = false,
}: {
  size?: keyof typeof sizes;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <img
      src={size === "footer" ? STORE_FOOTER_LOGO_SRC : STORE_LOGO_SRC}
      alt={decorative ? "" : STORE_NAME}
      className={cn("object-contain object-left", sizes[size], className)}
    />
  );
}
