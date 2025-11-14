"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { ItemRecord } from "@/domain/items";
import { loadItemsCache } from "@/utils/itemsCache";

export interface UseDetailsAutocompleteLogicV2Options {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (item: ItemRecord) => void;
  onBlurAutoCategorize?: (value: string) => void;
}

export interface UseDetailsAutocompleteLogicV2Result {
  containerRef: RefObject<HTMLDivElement | null>;
  suggestions: ItemRecord[];
  isOpen: boolean;
  highlightIndex: number;
  setHighlightIndex: (index: number) => void;
  onChangeValue: (value: string) => void;
  onSelect: (item: ItemRecord) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onFocus: () => void;
}

export function useDetailsAutocompleteLogicV2({
  value,
  onChange,
  onSelectSuggestion,
  onBlurAutoCategorize,
}: UseDetailsAutocompleteLogicV2Options): UseDetailsAutocompleteLogicV2Result {
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [suggestions, setSuggestions] = useState<ItemRecord[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndexState] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void (async () => {
      const cached = await loadItemsCache();
      if (cached?.length) {
        setItems(cached);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleCacheUpdated = () => {
      void (async () => {
        const cached = await loadItemsCache();
        if (cached) {
          setItems(cached);
        }
      })();
    };

    window.addEventListener("itemsCacheUpdated", handleCacheUpdated);
    return () => window.removeEventListener("itemsCacheUpdated", handleCacheUpdated);
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      const query = value.trim().toLowerCase();
      if (!query) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      const matches = items
        .filter((item) => item.name.toLowerCase().includes(query))
        .slice(0, 10);

      setSuggestions(matches);
      setIsOpen(matches.length > 0);
      setHighlightIndexState(0);
    }, 80);

    return () => clearTimeout(handle);
  }, [value, items]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onChangeValue = useCallback(
    (next: string) => {
      onChange(next);
    },
    [onChange]
  );

  const onSelect = useCallback(
    (item: ItemRecord) => {
      onChange(item.name);
      onSelectSuggestion?.(item);
      requestAnimationFrame(() => setIsOpen(false));
      setHighlightIndexState(0);
      onBlurAutoCategorize?.(item.name);
    },
    [onBlurAutoCategorize, onChange, onSelectSuggestion]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || suggestions.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightIndexState((index) => (index + 1) % suggestions.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightIndexState((index) =>
          (index - 1 + suggestions.length) % suggestions.length
        );
      } else if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        const selected = suggestions[highlightIndex];
        if (selected) {
          onSelect(selected);
        }
      }
    },
    [highlightIndex, isOpen, onSelect, suggestions]
  );

  const onBlur = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed) {
      onBlurAutoCategorize?.(trimmed);
    }
    setIsOpen(false);
  }, [onBlurAutoCategorize, value]);

  const onFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  }, [suggestions.length]);

  const handleSetHighlight = useCallback((index: number) => {
    setHighlightIndexState(index);
  }, []);

  return {
    containerRef,
    suggestions,
    isOpen,
    highlightIndex,
    setHighlightIndex: handleSetHighlight,
    onChangeValue,
    onSelect,
    onKeyDown,
    onBlur,
    onFocus,
  };
}

