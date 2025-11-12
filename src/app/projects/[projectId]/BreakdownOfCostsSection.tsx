"use client";

import { useMemo, useState } from "react";
import { useProjectExpenseBreakdown } from "@/hooks/expenses/useProjectExpenseBreakdown";
import { useProject } from "@/hooks/projects/useProjects";
import { updateProjectCE } from "@/data/projects.repo.ce";
import { peso, pct } from "@/utils/format";
import { RotateCw } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types & constants                                                          */
/* -------------------------------------------------------------------------- */
interface BreakdownOfCostsSectionProps {
  projectId: string;
}

type TabKey = "cabinets" | "materials" | "transport";

type TradeKey =
  | "carpentry"
  | "electrical"
  | "tiles"
  | "plumbing"
  | "paint"
  | "ceiling"
  | "flooring"
  | "miscellaneous"
  | "toolsEquipment"
  | "transport";

const EMPTY_COST_ESTIMATES: Partial<Record<TradeKey, number>> = {};

const MATERIAL_TRADES: TradeKey[] = [
  "electrical",
  "tiles",
  "plumbing",
  "paint",
  "ceiling",
  "flooring",
  "miscellaneous",
  "toolsEquipment",
];

const toLower = (s: unknown) => (typeof s === "string" ? s.toLowerCase() : "");

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function BreakdownOfCostsSection({
  projectId,
}: BreakdownOfCostsSectionProps) {
  const { data, loading, refetch } = useProjectExpenseBreakdown(projectId);
  const { data: project } = useProject(projectId);

  const [activeTab, setActiveTab] = useState<TabKey>("cabinets");
  const [editingKey, setEditingKey] = useState<TradeKey | null>(null);
  const [draft, setDraft] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState("");

  const ce = project?.costEstimates ?? EMPTY_COST_ESTIMATES;

  const refresh = async () => {
    await refetch();
    setLastUpdated(
      new Date().toLocaleString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    );
  };

  const saveCE = async (key: TradeKey, value: number) => {
    try {
      await updateProjectCE(projectId, { [key]: value });
    } finally {
      setEditingKey(null);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */
  const sumWhere = (pred: (cat: string, sub: string) => boolean) =>
    data.reduce((sum, r) => {
      const cat = toLower(r.category);
      const sub = toLower(r.subCategory);
      return pred(cat, sub) ? sum + (r.total ?? 0) : sum;
    }, 0);

  /* ------------------------------------------------------------------------ */
  /* CABINETS                                                                 */
  /* ------------------------------------------------------------------------ */
  const cabBoards = sumWhere((cat, sub) => cat === "cabinets" && sub === "boards");
  const cabLaminate = sumWhere((cat, sub) => cat === "cabinets" && sub === "laminate");
  const cabRugby = sumWhere((cat, sub) => cat === "cabinets" && sub === "rugby");
  const cabAccessories = sumWhere(
    (cat, sub) => cat === "cabinets" && sub === "accessories"
  );
  const cabLabor = sumWhere((cat, sub) => cat === "salary" && sub === "carpentry");
  const cabTotal = cabBoards + cabLaminate + cabRugby + cabAccessories + cabLabor;
  const cabCE = ce.carpentry ?? 0;
  const cabProfit = Math.max(0, cabCE - cabTotal);
  const cabPct = cabCE > 0 ? (cabProfit / cabCE) * 100 : 0;

  /* ------------------------------------------------------------------------ */
  /* MATERIALS                                                                */
  /* ------------------------------------------------------------------------ */
  const materialsByTrade = useMemo(() => {
    const emptyRecord = (): Record<TradeKey, number> =>
      Object.fromEntries(MATERIAL_TRADES.map((t) => [t, 0])) as Record<
        TradeKey,
        number
      >;

    const mats = emptyRecord();
    const sal = emptyRecord();

    for (const r of data) {
      const cat = toLower(r.category);
      const sub = toLower(r.subCategory);
      const amt = r.total ?? 0;

      let trade: TradeKey | null = null;
      if (sub.includes("electric")) trade = "electrical";
      else if (sub.includes("tile")) trade = "tiles";
      else if (sub.includes("plumb")) trade = "plumbing";
      else if (sub.includes("paint")) trade = "paint";
      else if (sub.includes("ceil")) trade = "ceiling";
      else if (sub.includes("floor")) trade = "flooring";
      else if (sub.includes("misc")) trade = "miscellaneous";
      else if (sub.includes("tool")) trade = "toolsEquipment";
      if (!trade) continue;

      const isIgnoredSalary =
        cat === "salary" &&
        (sub === "labor" ||
          sub === "engineer" ||
          sub.includes("mandatory") ||
          sub === "cabinets");
      if (isIgnoredSalary) continue;

      if (cat === "materials") mats[trade] += amt;
      if (cat === "salary" && trade !== "toolsEquipment") sal[trade] += amt;
    }

    return { mats, sal };
  }, [data]);

  const matTotalsRow = useMemo(() => {
    let matsSum = 0;
    let salSum = 0;
    let ceSum = 0;
    let profitSum = 0;

    MATERIAL_TRADES.forEach((t) => {
      const rowTotal = (materialsByTrade.mats[t] ?? 0) + (materialsByTrade.sal[t] ?? 0);
      const ceVal = ce[t] ?? 0;
      const profit = Math.max(0, ceVal - rowTotal);
      matsSum += materialsByTrade.mats[t] ?? 0;
      salSum += materialsByTrade.sal[t] ?? 0;
      ceSum += ceVal;
      profitSum += profit;
    });

    const percent = ceSum > 0 ? (profitSum / ceSum) * 100 : 0;
    return { matsSum, salSum, ceSum, profitSum, percent };
  }, [materialsByTrade, ce]);

  /* ------------------------------------------------------------------------ */
  /* TRANSPORT                                                                */
  /* ------------------------------------------------------------------------ */
  const transHauling = sumWhere((cat, sub) => cat === "transport" && sub === "hauling");
  const transDelivery = sumWhere((cat, sub) => cat === "transport" && sub === "delivery");
  const transTotal = transHauling + transDelivery;
  const transCE = ce.transport ?? 0;
  const transProfit = Math.max(0, transCE - transTotal);
  const transPct = transCE > 0 ? (transProfit / transCE) * 100 : 0;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */
  return (
    <section className="space-y-6">
     

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#3a3a3a]">
        {(["cabinets", "materials", "transport"] as TabKey[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-2 py-2 text-sm -mb-px border-b-2 transition ${
              activeTab === t
                ? "border-white text-white"
                : "border-transparent text-[#9ca3af] hover:text-[#e5e5e5]"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* CABINETS */}
      {activeTab === "cabinets" && (
        <div className="border border-[#3a3a3a] rounded-xl overflow-x-auto bg-[#1f1f1f]">
          <table className="min-w-full text-sm text-[#d1d5db] border-collapse">
            <thead className="bg-[#262626] border-b border-[#3a3a3a]">
              <tr>
                <th className="px-4 py-2 text-sm font-medium text-left">Subcategory</th>
                <th className="px-4 py-2 text-sm font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Boards", cabBoards],
                ["Laminate", cabLaminate],
                ["Rugby", cabRugby],
                ["Accessories", cabAccessories],
                ["Labor", cabLabor],
              ].map(([label, val]) => (
                <tr key={label as string} className="border-b border-[#3a3a3a]">
                  <td className="px-4 py-[6px]">{label}</td>
                  <td className="px-4 py-[6px] text-right">{peso(val as number)}</td>
                </tr>
              ))}
              <tr className="bg-[#2a2a2a] font-semibold">
                <td className="px-4 py-2">Total</td>
                <td className="px-4 py-2 text-right">{peso(cabTotal)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-[#9ca3af]">CE</td>
                <td
                  className="px-4 py-2 text-right rounded-md cursor-pointer"
                  onClick={() => {
                    setEditingKey("carpentry");
                    setDraft(cabCE);
                  }}
                >
                  {editingKey === "carpentry" ? (
                    <input
                      autoFocus
                      type="text"
                      inputMode="decimal"
                      value={draft}
                      onChange={(e) =>
                        setDraft(Number(e.target.value.replace(/[₱,]/g, "")) || 0)
                      }
                      onBlur={() => saveCE("carpentry", draft)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveCE("carpentry", draft);
                        if (e.key === "Escape") setEditingKey(null);
                      }}
                      className="w-[8rem] text-right bg-[#262626] border border-[#3a3a3a] rounded-md px-3 py-[6px] focus:outline-none focus:ring-1 focus:ring-[#4b5563]"
                    />
                  ) : (
                    peso(cabCE)
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-[#9ca3af]">Profit</td>
                <td className="px-4 py-2 text-right">{peso(cabProfit)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-[#9ca3af]">% Profit</td>
                <td className="px-4 py-2 text-right">{pct(cabPct)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* MATERIALS */}
      {activeTab === "materials" && (
        <div className="border border-[#3a3a3a] rounded-xl overflow-x-auto bg-[#1f1f1f]">
          <table className="min-w-full text-sm text-[#d1d5db] border-collapse">
            <thead className="bg-[#262626] border-b border-[#3a3a3a]">
              <tr>
                <th className="px-4 py-2 font-medium text-left">Trade</th>
                <th className="px-4 py-2 font-medium text-right">Materials</th>
                <th className="px-4 py-2 font-medium text-right">Salary</th>
                <th className="px-4 py-2 font-medium text-right">Total</th>
                <th className="px-4 py-2 font-medium text-right">CE</th>
                <th className="px-4 py-2 font-medium text-right">Profit</th>
                <th className="px-4 py-2 font-medium text-right">% Profit</th>
              </tr>
            </thead>
            <tbody>
              {MATERIAL_TRADES.map((trade) => {
                const mats = materialsByTrade.mats[trade] ?? 0;
                const sal = materialsByTrade.sal[trade] ?? 0;
                const rowTotal = mats + sal;
                const ceVal = ce[trade] ?? 0;
                const profit = Math.max(0, ceVal - rowTotal);
                const percent = ceVal > 0 ? (profit / ceVal) * 100 : 0;
                const label =
                  trade === "toolsEquipment"
                    ? "Tools and Equipment"
                    : trade.charAt(0).toUpperCase() + trade.slice(1);

                return (
                  <tr key={trade} className="border-b border-[#3a3a3a]">
                    <td className="px-4 py-[6px]">{label}</td>
                    <td className="px-4 py-[6px] text-right">{peso(mats)}</td>
                    <td className="px-4 py-[6px] text-right">{peso(sal)}</td>
                    <td className="px-4 py-[6px] text-right">{peso(rowTotal)}</td>
                    <td
                      className="px-4 py-[6px] text-right cursor-pointer rounded-md"
                      onClick={() => {
                        setEditingKey(trade);
                        setDraft(ceVal);
                      }}
                    >
                      {editingKey === trade ? (
                        <input
                          autoFocus
                          type="text"
                          inputMode="decimal"
                          value={draft}
                          onChange={(e) =>
                            setDraft(Number(e.target.value.replace(/[₱,]/g, "")) || 0)
                          }
                          onBlur={() => saveCE(trade, draft)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveCE(trade, draft);
                            if (e.key === "Escape") setEditingKey(null);
                          }}
                          className="w-[8rem] text-right bg-[#262626] border border-[#3a3a3a] rounded-md px-3 py-[6px] focus:outline-none focus:ring-1 focus:ring-[#4b5563]"
                        />
                      ) : (
                        peso(ceVal)
                      )}
                    </td>
                    <td className="px-4 py-[6px] text-right">{peso(profit)}</td>
                    <td className="px-4 py-[6px] text-right">{pct(percent)}</td>
                  </tr>
                );
              })}
              <tr className="bg-[#2a2a2a] font-semibold">
                <td className="px-4 py-2">TOTAL</td>
                <td className="px-4 py-2 text-right">
                  {peso(matTotalsRow.matsSum)}
                </td>
                <td className="px-4 py-2 text-right">
                  {peso(matTotalsRow.salSum)}
                </td>
                <td className="px-4 py-2 text-right">
                  {peso(matTotalsRow.matsSum + matTotalsRow.salSum)}
                </td>
                <td className="px-4 py-2 text-right">{peso(matTotalsRow.ceSum)}</td>
                <td className="px-4 py-2 text-right">
                  {peso(matTotalsRow.profitSum)}
                </td>
                <td className="px-4 py-2 text-right">{pct(matTotalsRow.percent)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TRANSPORT */}
      {activeTab === "transport" && (
        <div className="border border-[#3a3a3a] rounded-xl overflow-x-auto bg-[#1f1f1f]">
          <table className="min-w-full text-sm text-[#d1d5db] border-collapse">
            <thead className="bg-[#262626] border-b border-[#3a3a3a]">
              <tr>
                <th className="px-4 py-2 font-medium text-left">Subcategory</th>
                <th className="px-4 py-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Hauling", transHauling],
                ["Delivery", transDelivery],
              ].map(([label, val]) => (
                <tr key={label as string} className="border-b border-[#3a3a3a]">
                  <td className="px-4 py-[6px]">{label}</td>
                  <td className="px-4 py-[6px] text-right">{peso(val as number)}</td>
                </tr>
              ))}
                            <tr className="bg-[#2a2a2a] font-semibold">
                <td className="px-4 py-2">Total</td>
                <td className="px-4 py-2 text-right">{peso(transTotal)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-[#9ca3af]">CE</td>
                <td
                  className="px-4 py-2 text-right rounded-md cursor-pointer"
                  onClick={() => {
                    setEditingKey("transport");
                    setDraft(transCE);
                  }}
                >
                  {editingKey === "transport" ? (
                    <input
                      autoFocus
                      type="text"
                      inputMode="decimal"
                      value={draft}
                      onChange={(e) =>
                        setDraft(Number(e.target.value.replace(/[₱,]/g, "")) || 0)
                      }
                      onBlur={() => saveCE("transport", draft)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveCE("transport", draft);
                        if (e.key === "Escape") setEditingKey(null);
                      }}
                      className="w-[8rem] text-right bg-[#262626] border border-[#3a3a3a] rounded-md px-3 py-[6px] focus:outline-none focus:ring-1 focus:ring-[#4b5563]"
                    />
                  ) : (
                    peso(transCE)
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-[#9ca3af]">Profit</td>
                <td className="px-4 py-2 text-right">{peso(transProfit)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-[#9ca3af]">% Profit</td>
                <td className="px-4 py-2 text-right">{pct(transPct)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

