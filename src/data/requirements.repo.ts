import {
  collection,
  doc,
  getFirestore,
  updateDoc,
  deleteDoc,
  addDoc,
  getDocs,
  type DocumentData,
} from "firebase/firestore";
import type { Requirement } from "@/domain/validation/requirementSchema";

/* -------------------------------------------------------------------------- */
/* 🔧 Firestore References                                                    */
/* -------------------------------------------------------------------------- */
function requirementsRef(projectId: string) {
  return collection(getFirestore(), "projects", projectId, "requirements");
}

/* -------------------------------------------------------------------------- */
/* ➕ Add Requirement                                                         */
/* -------------------------------------------------------------------------- */
export async function addRequirement(projectId: string, data: Requirement): Promise<void> {
  const ref = requirementsRef(projectId);
  // Create the doc and ensure Firestore ID and local `id` field match
  const docRef = await addDoc(ref, data as DocumentData);
  await updateDoc(docRef, { id: docRef.id });
}

/* -------------------------------------------------------------------------- */
/* ✏️ Update Requirement                                                      */
/* -------------------------------------------------------------------------- */
export async function updateRequirement(projectId: string, req: Requirement): Promise<void> {
  if (!req.id) throw new Error("Missing requirement ID for update.");
  const ref = doc(getFirestore(), "projects", projectId, "requirements", req.id);
  await updateDoc(ref, { ...req });
}

/* -------------------------------------------------------------------------- */
/* ❌ Delete Requirement                                                      */
/* -------------------------------------------------------------------------- */
export async function deleteRequirement(projectId: string, _area: string, id: string): Promise<void> {
  const ref = doc(getFirestore(), "projects", projectId, "requirements", id);
  await deleteDoc(ref);
}

/* -------------------------------------------------------------------------- */
/* 📦 Get All Requirements                                                    */
/* -------------------------------------------------------------------------- */
export async function getRequirements(projectId: string): Promise<Requirement[]> {
  const ref = requirementsRef(projectId);
  const snap = await getDocs(ref);
  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
      } as Requirement)
  );
}
