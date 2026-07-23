import { clsx } from "clsx";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const FIELD_BASE =
  "w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-ink-50 disabled:text-ink-400";

interface FieldWrapperProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FieldWrapper({ label, htmlFor, error, hint, children, className }: FieldWrapperProps) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink-800">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export function Input({ label, error, hint, wrapperClassName, className, id, name, ...rest }: InputProps) {
  const fieldId = id ?? name;
  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error} hint={hint} className={wrapperClassName}>
      <input
        id={fieldId}
        name={name}
        className={clsx(FIELD_BASE, error && "border-red-400 focus:border-red-500 focus:ring-red-500/20", className)}
        aria-invalid={Boolean(error)}
        {...rest}
      />
    </FieldWrapper>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export function Textarea({ label, error, hint, wrapperClassName, className, id, name, ...rest }: TextareaProps) {
  const fieldId = id ?? name;
  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error} hint={hint} className={wrapperClassName}>
      <textarea
        id={fieldId}
        name={name}
        className={clsx(FIELD_BASE, "min-h-24 resize-y", error && "border-red-400 focus:border-red-500 focus:ring-red-500/20", className)}
        aria-invalid={Boolean(error)}
        {...rest}
      />
    </FieldWrapper>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  wrapperClassName,
  className,
  id,
  name,
  options,
  placeholder,
  ...rest
}: SelectProps) {
  const fieldId = id ?? name;
  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error} hint={hint} className={wrapperClassName}>
      <select
        id={fieldId}
        name={name}
        className={clsx(FIELD_BASE, "appearance-none", error && "border-red-400 focus:border-red-500 focus:ring-red-500/20", className)}
        aria-invalid={Boolean(error)}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
