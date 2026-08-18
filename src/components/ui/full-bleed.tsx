import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/container";

export function FullBleed({
  children,
  className,
  contained = false,
}: {
  children: React.ReactNode;
  className?: string;
  contained?: boolean;
}) {
  return (
    <div className={cn("relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2", className)}>
      {contained ? <Container>{children}</Container> : children}
    </div>
  );
}
