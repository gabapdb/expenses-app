"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close on ESC key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-[#1f1f1f] p-6 rounded-xl shadow-lg max-w-sm w-full border border-[#2e2e2e]"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-lg font-semibold text-[#e5e5e5] mb-3">{title}</h2>

        {/* Message */}
        <p className="text-sm text-[#9ca3af] mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            className="bg-[#2a2a2a] text-[#e5e5e5] hover:bg-[#3a3a3a]"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            className={
              danger
                ? "bg-[#b91c1c] text-white hover:bg-[#dc2626]"
                : "bg-[#2a2a2a] text-[#e5e5e5] hover:bg-[#3a3a3a]"
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
