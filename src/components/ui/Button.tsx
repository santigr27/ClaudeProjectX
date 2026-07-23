import Link from "next/link";
import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-ink-200 disabled:text-ink-400",
  secondary: "bg-accent-600 text-white hover:bg-accent-700 disabled:bg-ink-200 disabled:text-ink-400",
  outline: "border border-ink-300 bg-white text-ink-800 hover:border-ink-400 hover:bg-ink-50 disabled:text-ink-300",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-100 disabled:text-ink-300",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonAsButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

interface ButtonAsLinkProps extends BaseProps {
  href: string;
  target?: string;
  rel?: string;
}

export function Button(props: ButtonAsButtonProps | ButtonAsLinkProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth,
    className,
    children,
    href,
    target,
    rel,
    ...nativeProps
  } = props as ButtonAsButtonProps & Partial<ButtonAsLinkProps>;

  const classes = clsx(
    "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && "w-full",
    className,
  );

  if (href) {
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button {...nativeProps} className={classes}>
      {children}
    </button>
  );
}
