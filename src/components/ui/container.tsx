import { cn } from "@/lib/cn";

export const containerClassName = "w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12";

export type ContainerProps = React.ComponentProps<"div">;

export function Container({ className, ...props }: ContainerProps) {
  return <div className={cn(containerClassName, className)} {...props} />;
}
