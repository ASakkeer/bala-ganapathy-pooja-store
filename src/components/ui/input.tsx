import { cn } from "@/lib/cn";

export type InputProps = React.ComponentProps<"input"> & {
  error?: string;
};

export function Input({ className, error, id, ...props }: InputProps) {
  const errorId = id ? `${id}-error` : undefined;

  return (
    <div className="w-full">
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-11 w-full rounded-full bg-brand/[0.04] px-4 text-text ring-1 ring-transparent transition-shadow",
          "placeholder:text-muted",
          "focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "ring-danger/40",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="mt-1 px-4 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
