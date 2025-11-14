"use client";

import type { ItemRecord } from "@/domain/items";
import Input from "@/components/ui/Input";
import { useDetailsAutocompleteLogicV2 } from "@/hooks/expenses/v2/useDetailsAutocompleteLogicV2";

interface DetailsAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelectSuggestion?: (item: ItemRecord) => void;
  onBlurAutoCategorize?: (val: string) => void;
}

export default function DetailsAutocomplete({
  value,
  onChange,
  onSelectSuggestion,
  onBlurAutoCategorize,
}: DetailsAutocompleteProps) {
  const {
    containerRef,
    suggestions,
    isOpen,
    highlightIndex,
    setHighlightIndex,
    onChangeValue,
    onSelect,
    onKeyDown,
    onBlur,
    onFocus,
  } = useDetailsAutocompleteLogicV2({
    value,
    onChange,
    onSelectSuggestion,
    onBlurAutoCategorize,
  });

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        placeholder="Description / Item name"
        value={value}
        onChange={(event) => onChangeValue(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="input-dark"
      />

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[#3a3a3a] bg-[#1f1f1f] shadow-xl">
          {suggestions.map((item, idx) => {
            const isActive = idx === highlightIndex;
            return (
              <button
                key={item.id ?? item.name}
                type="button"
                onClick={() => onSelect(item)}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={[
                  "block w-full px-3 py-2 text-left text-sm transition-colors",
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

