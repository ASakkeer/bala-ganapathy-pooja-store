import { cn } from "@/lib/cn";

export const containerClassName =
  "mx-auto w-full max-w-container-max px-4 sm:px-6 lg:px-grid-margin";

export type ContainerProps = React.ComponentProps<"div">;

export function Container({ className, ...props }: ContainerProps) {
  return <div className={cn(containerClassName, className)} {...props} />;
}
