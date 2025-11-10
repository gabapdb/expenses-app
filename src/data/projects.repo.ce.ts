import { z } from "zod";
import { db } from "@/core/firebase";
import { doc, setDoc } from "firebase/firestore";

export const CostEstimatesSchema = z.object({
carpentry: z.number().nonnegative().optional(),
electrical: z.number().nonnegative().optional(),
tiles: z.number().nonnegative().optional(),
plumbing: z.number().nonnegative().optional(),
paint: z.number().nonnegative().optional(),
flooring: z.number().nonnegative().optional(),
miscellaneous: z.number().nonnegative().optional(),
toolsEquipment: z.number().nonnegative().optional(),
ceiling: z.number().nonnegative().optional(),
transport: z.number().nonnegative().optional(),
});


export type CostEstimates = z.infer<typeof CostEstimatesSchema>;


export async function updateProjectCE(
projectId: string,
cePatch: CostEstimates
): Promise<void> {
const parsed = CostEstimatesSchema.parse(cePatch);
const ref = doc(db, "projects", projectId);
await setDoc(ref, { costEstimates: parsed }, { merge: true });
}