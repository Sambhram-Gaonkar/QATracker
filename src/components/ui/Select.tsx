import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: readonly string[];
};

export function Select({ label, options, className, id, ...props }: SelectProps) {
  const inputId = id ?? props.name;
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700" htmlFor={inputId}>
      {label}
      <select
        id={inputId}
        className={cn(
          "min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none ring-slate-950/10 transition focus:ring-4",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
