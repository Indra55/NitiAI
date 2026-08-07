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
    <label className="flex h-14 items-center justify-between gap-4 rounded-[10px] border border-black/25 bg-white px-5 text-lg leading-none dark:border-white/15 dark:bg-white/5 xl:text-xl">
      <input
        type={type}
        value={value}
        aria-label={label}
        disabled={disabled}
        onFocus={() => setIsEditing(true)}
        onBlur={() => {
          if (!value) setIsEditing(false);
        }}
        onChange={(e) => {
          if (onChange) onChange(e);
          setIsEditing(true);
        }}
        className="min-w-0 flex-1 truncate bg-transparent text-black/80 outline-none placeholder:text-black/30 dark:text-white dark:placeholder:text-white/35 disabled:opacity-50"
      />
      {!isEditing && !value && (
        <span className="shrink-0 text-black dark:text-white pointer-events-none">{label}</span>
      )}
    </label>
  );
}

export function CheckboxLine({ children }: { children: ReactNode }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <span className="relative mt-1 size-3.5 shrink-0">
        <input
          type="checkbox"
          className="peer size-full appearance-none rounded-[2px] border border-black/25 bg-white checked:border-black checked:bg-black dark:border-white/30 dark:bg-white/5 dark:checked:border-white dark:checked:bg-white cursor-pointer"
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
      className="mt-9 flex h-12 w-full items-center justify-center rounded-[10px] border border-black/40 bg-black text-xl font-medium text-white transition-colors hover:bg-black/85 dark:border-white/40 dark:bg-white dark:text-black dark:hover:bg-white/85 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
