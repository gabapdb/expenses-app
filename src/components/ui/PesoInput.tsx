"use client";

import { useState } from "react";

interface PesoInputProps {
  value: number;
  onChange: (v: number) => void;
  className?: string;
}

export default function PesoInput({ value, onChange, className }: PesoInputProps) {
  const [display, setDisplay] = useState(formatDisplay(value));

  function formatDisplay(num: number | string): string {
    const n = Number(num);
    if (isNaN(n)) return "";
    return `₱${n.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[₱,]/g, "");
    const numeric = Number(raw);
    setDisplay(formatDisplay(raw));
    if (!isNaN(numeric)) onChange(numeric);
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      className={`w-full rounded-lg border border-gray-300 px-2 py-2 text-sm ${className ?? ""}`}
      value={display}
      onChange={handleChange}
      onFocus={() => {
        setDisplay(value ? String(value) : "");
      }}
      onBlur={() => {
        setDisplay(formatDisplay(value));
      }}
    />
  );
}
