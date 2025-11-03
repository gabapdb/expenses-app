"use client";

import { useState } from "react";
import Button from "./Button";
import Card from "./Card";

interface AddItemModalProps {
  title: string;
  placeholder?: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

export default function AddItemModal({
  title,
  placeholder,
  onSave,
  onClose,
}: AddItemModalProps) {
  const [value, setValue] = useState("");

  function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSave(trimmed);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <Card className="bg-white w-full max-w-sm p-5 space-y-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <input
          type="text"
          placeholder={placeholder ?? "Enter name..."}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
        />
        <div className="flex justify-end gap-2">
          <Button
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="bg-gray-900 text-white hover:bg-black"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}
