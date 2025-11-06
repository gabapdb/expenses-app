"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { ItemRecord } from "@/domain/items";
import { loadItemsCache } from "@/utils/itemsCache";
import Input from "@/components/ui/Input";

interface DetailsAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelectSuggestion?: (item: ItemRecord) => void;
  onBlurAutoCategorize?: (val: string) => void;
}

/**
 * Fast local autocomplete for the "Details" field.
 * - Offline-capable via IndexedDB cache
 * - Auto-refreshes live when cache updates
 * - Prunes stale items automatically (> 90 days)
 * - Handles keyboard + hover navigation
 */
export default function DetailsAutocomplete({
  value,
  onChange,
  onSelectSuggestion,
  onBlurAutoCategorize,
}: DetailsAutocompleteProps) {
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [suggestions, setSuggestions] = useState<ItemRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ------------------------- Load + auto-refresh cache ------------------------ */
  useEffect(() => {
    const load = async () => {
      const cached = await loadItemsCache();
      if (cached?.length) setItems(cached);
    };
    load();

    // 🔄 Listen for updates from autoCategorizer
    const handleUpdate = async () => {
      const refreshed = await loadItemsCache();
      if (refreshed?.length) setItems(refreshed);
    };
    window.addEventListener("itemsCacheUpdated", handleUpdate);
    return () => window.removeEventListener("itemsCacheUpdated", handleUpdate);
  }, []);

  /* ------------------------------- Filter logic ------------------------------- */
  useEffect(() => {
    const handle = setTimeout(() => {
      const q = value.trim().toLowerCase();
      if (!q) {
        setSuggestions([]);
        setOpen(false);
        return;
      }

      const matches = items
        .filter((i) => i.nameLower.includes(q))
        .slice(0, 10);

      setSuggestions(matches);
      setOpen(matches.length > 0);
      setHighlightIndex(0);
    }, 80);
    return () => clearTimeout(handle);
  }, [value, items]);

  /* ------------------------- Close dropdown on click-out ---------------------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* -------------------------- Handle suggestion pick -------------------------- */
  const selectSuggestion = useCallback(
    (item: ItemRecord) => {
      onChange(item.name);
      onSelectSuggestion?.(item);
      requestAnimationFrame(() => setOpen(false));
      onBlurAutoCategorize?.(item.name);
    },
    [onChange, onSelectSuggestion, onBlurAutoCategorize]
  );

  /* -------------------------- Keyboard navigation ----------------------------- */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const selected = suggestions[highlightIndex];
      if (selected) selectSuggestion(selected);
      requestAnimationFrame(() => setOpen(false));
    }
  };

  /* ---------------------------- Blur autoCategorize ---------------------------- */
  const handleBlur = () => {
    if (value.trim()) onBlurAutoCategorize?.(value);
  };

  /* ---------------------------------- Render ---------------------------------- */
  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        placeholder="Description / Item name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length && setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="input-dark"
      />

      {open && suggestions.length > 0 && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-[#3a3a3a] bg-[#1f1f1f] shadow-xl max-h-48 overflow-y-auto">
          {suggestions.map((item, idx) => {
            const isActive = idx === highlightIndex;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => selectSuggestion(item)}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={[
                  "block w-full text-left px-3 py-2 text-sm transition-colors",
                  "focus:outline-none",
                  isActive
                    ? "bg-[#374151] text-white"
                    : "text-[#e5e5e5] hover:bg-[#2a2a2a] hover:text-white",
                ].join(" ")}
              >
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-[#9ca3af]">
                  {item.category} • {item.subCategory}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
