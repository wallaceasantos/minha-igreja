import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "accent";
  children?: React.ReactNode;
  className?: string;
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variants = {
    default:
      "border-transparent bg-indigo-600 text-white hover:bg-indigo-600/80 shadow-sm",
    secondary:
      "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-150 hover:bg-slate-100/80",
    destructive:
      "border-transparent bg-red-500 text-white hover:bg-red-500/80",
    outline: "text-slate-950 dark:text-slate-100 border-slate-200 dark:border-slate-800",
    accent:
      "border-transparent bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-sm",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  return <div className={combinedClassName} {...props} />;
}

export { Badge };
