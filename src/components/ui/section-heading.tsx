import { cn } from "@/lib/cn";

export type SectionHeadingProps = {
  title: string;
  description?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
};

export function SectionHeading({
  title,
  description,
  as: Tag = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-2", className)}>
      <Tag className="font-serif text-3xl font-medium tracking-tight text-text md:text-4xl">
        {title}
      </Tag>
      {description ? <p className="text-base leading-relaxed text-muted">{description}</p> : null}
    </div>
  );
}
