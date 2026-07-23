"use client";

import { clsx } from "clsx";

interface SegmentedToggleOption {
  value: string;
  label: string;
}

export function SegmentedToggle({
  options,
  value,
  onChange,
  name,
  className,
}: {
  options: SegmentedToggleOption[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={name}
      className={clsx("inline-flex rounded-full bg-ink-100 p-1", className)}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={clsx(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              isActive ? "bg-white text-brand-700 shadow-sm" : "text-ink-500 hover:text-ink-700",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
