import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id ?? props.name;
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700" htmlFor={inputId}>
      {label}
      <textarea
        id={inputId}
        className={cn(
          "min-h-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none ring-slate-950/10 transition placeholder:text-slate-400 focus:ring-4",
          error && "border-red-300 ring-red-100",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
