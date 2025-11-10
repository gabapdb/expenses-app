"use client";

import { useCallback } from "react";
import type { Requirement } from "@/domain/validation/requirementSchema";
import { deleteRequirement } from "@/data/requirements.repo";
import StatusBadge from "./StatusBadge";

interface RequirementsTableProps {
  projectId: string;
  area: string;
  requirements: Requirement[];
  onUpdated?: () => void;
  onRowClick?: (req: Requirement) => void;
}

export default function RequirementsTable({
  projectId,
  requirements,
  onUpdated,
  onRowClick,
}: RequirementsTableProps) {
  const handleDelete = useCallback(
    async (req: Requirement) => {
      await deleteRequirement(projectId, req.area, req.id);
      onUpdated?.();
    },
    [projectId, onUpdated]
  );

  return (
    <div className="mt-6 border border-[#3a3a3a] rounded-xl overflow-x-auto bg-[#1f1f1f]">
      <table className="min-w-full text-sm text-[#d1d1d1] border-collapse">
        <thead className="bg-[#222] text-[#bbb]">
          <tr className="text-left">
            <th className="px-3 py-2 w-[10%]">Store</th>
            <th className="px-3 py-2 w-[14%]">Item</th>
            <th className="px-3 py-2 w-[12%]">Type</th>
            <th className="px-3 py-2 w-[10%]">Dimensions</th>
            <th className="px-3 py-2 w-[7%] text-center">Approved</th>
            <th className="px-3 py-2 w-[7%] text-center">Not Approved</th>
            <th className="px-3 py-2 w-[20%]">Status</th>
            <th className="px-3 py-2 w-[20%]">Notes</th>
            <th className="px-3 py-2 w-[6%] text-right"></th>
          </tr>
        </thead>

        <tbody>
          {requirements.map((req) => (
            <tr
              key={req.id}
              className="border-t border-[#2e2e2e] hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => onRowClick?.(req)}
            >
              <td className="px-3 py-2">{req.store}</td>
              <td className="px-3 py-2">{req.item}</td>
              <td className="px-3 py-2">{req.type}</td>
              <td className="px-3 py-2">{req.dimensions}</td>

              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={!!req.approved}
                  readOnly
                  className="accent-green-500 cursor-default"
                />
              </td>
              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={!!req.notApproved}
                  readOnly
                  className="accent-red-500 cursor-default"
                />
              </td>

              <td className="px-3 py-2">
                <StatusBadge status={req.status} />
              </td>

              <td className="px-3 py-2">{req.notes}</td>

              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  className="rounded-md bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDelete(req);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {requirements.length === 0 && (
            <tr>
              <td colSpan={9} className="px-3 py-6 text-center text-[#999]">
                No requirements yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
