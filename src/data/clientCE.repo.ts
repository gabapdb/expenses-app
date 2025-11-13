import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/core/firebase";
import {
  costEstimateSchema,
  type CostEstimates,
} from "@/domain/validation/costEstimateSchema";
import { clientSchema } from "@/domain/validation/clientSchema";

export async function getProjectCostEstimates(
  clientId: string,
  projectId: string
): Promise<CostEstimates> {
  const ref = doc(db, "clients", clientId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return {};

  const parsed = clientSchema.safeParse({ id: snap.id, ...snap.data() });
  if (!parsed.success) {
    console.error("[CE REPO] Invalid client document", parsed.error.flatten());
    return {};
  }

  const project = parsed.data.projects[projectId];
  return project?.designPhase?.costEstimates ?? {};
}



export async function updateProjectCostEstimates(
  clientId: string,
  projectId: string,
  ce: CostEstimates
): Promise<void> {
  const parsed = costEstimateSchema.parse(ce);

  const ref = doc(db, "clients", clientId);

  await setDoc(
    ref,
    { [`projects.${projectId}.designPhase.costEstimates`]: parsed },
    { merge: true }
  );
}
