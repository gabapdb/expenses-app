"use client";

import { useState, useEffect, startTransition } from "react";

interface PesoInputProps {
  value: number;
  onChange: (v: number) => void;
  onCommit?: (v: number) => void; // ✅ save on Enter or blur
  className?: string;
}

export default function PesoInput({
  value,
  onChange,
  onCommit,
  className,
}: PesoInputProps) {
  const [display, setDisplay] = useState<string>(String(value ?? ""));
  const [localValue, setLocalValue] = useState<number>(value ?? 0);

  // keep input in sync when external value changes
  useEffect(() => {
    if (value == null || Number.isNaN(value)) {
      return;
    }

    startTransition(() => {
      setDisplay(String(value));
      setLocalValue(value);
    });
  }, [value]);

  const formatDisplay = (num: number): string =>
    `₱${num.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const parse = (txt: string): number => {
    const n = Number(txt.replace(/[₱,]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const commitValue = (n: number) => {
    setDisplay(formatDisplay(n));
    onCommit?.(n); // ✅ trigger save
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplay(raw);
    const n = parse(raw);
    setLocalValue(n);
    onChange(n);
  };

  const handleBlur = () => {
    commitValue(localValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitValue(localValue);
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`w-full rounded-lg border border-gray-300 px-2 py-2 text-sm ${className ?? ""}`}
    />
  );
}
