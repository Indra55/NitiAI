"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export function FieldBox({
  label,
  value,
  type = "text",
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  type?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(value !== "");

  return (
    <label className="flex h-14 items-center justify-between gap-4 rounded-[10px] border border-slate-300 bg-slate-50/80 px-5 text-lg leading-none transition-colors focus-within:border-slate-800 dark:border-white/20 dark:bg-white/5 xl:text-xl">
      <input
        type={type}
        value={value}
        aria-label={label}
        disabled={disabled}
        suppressHydrationWarning
        onFocus={() => setIsEditing(true)}
        onBlur={() => {
          if (!value) setIsEditing(false);
        }}
        onChange={(e) => {
          if (onChange) onChange(e);
          setIsEditing(true);
        }}
        className="min-w-0 flex-1 truncate bg-transparent text-slate-900 font-medium outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/40 disabled:opacity-50"
      />
      {!isEditing && !value && (
        <span className="shrink-0 text-slate-600 dark:text-slate-300 font-medium pointer-events-none">{label}</span>
      )}
    </label>
  );
}

export function CheckboxLine({ children }: { children: ReactNode }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer text-slate-800 dark:text-slate-200">
      <span className="relative mt-1 size-3.5 shrink-0">
        <input
          type="checkbox"
          suppressHydrationWarning
          className="peer size-full appearance-none rounded-[2px] border border-slate-400 bg-white checked:border-slate-900 checked:bg-slate-900 dark:border-white/30 dark:bg-white/5 dark:checked:border-white dark:checked:bg-white cursor-pointer"
        />
        <svg
          viewBox="0 0 12 12"
          className="pointer-events-none absolute inset-0 hidden size-full p-0.5 text-white peer-checked:block dark:text-black"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 6.2 5 8.1 9 3.9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{children}</span>
    </label>
  );
}

export function AuthButton({ 
  children, 
  onClick, 
  type = "button", 
  disabled 
}: { 
  children: ReactNode; 
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning
      className="mt-9 flex h-12 w-full items-center justify-center rounded-[10px] bg-slate-900 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
