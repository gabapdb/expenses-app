import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";

import { db } from "@/core/firebase";
import { requirementSchema, type Requirement } from "@/domain/validation/requirementSchema";

function requirementsCollection(clientId: string) {
  return collection(db, "clients", clientId, "construction", "requirements");
}

export async function getRequirements(clientId: string): Promise<Requirement[]> {
  const ref = requirementsCollection(clientId);
  const snap = await getDocs(ref);

  return snap.docs.map((docSnap) =>
    requirementSchema.parse({
      id: docSnap.id,
      ...docSnap.data(),
      clientId,
    })
  );
}

export async function createRequirement(
  clientId: string,
  data: Requirement
): Promise<void> {
  if (!data.areaId) throw new Error("areaId is required");
  if (!data.scopeId) throw new Error("scopeId is required");
  if (!data.type) throw new Error("type is required");

  const ref = requirementsCollection(clientId);
  const payload = requirementSchema.parse({
    ...data,
    clientId,
  });

  const docRef = await addDoc(ref, payload);
  await updateDoc(docRef, { id: docRef.id });
}

export async function updateRequirement(
  clientId: string,
  requirement: Requirement
): Promise<void> {
  if (!requirement.id) throw new Error("Missing requirement ID for update.");
  if (!requirement.areaId) throw new Error("areaId is required");
  if (!requirement.scopeId) throw new Error("scopeId is required");
  if (!requirement.type) throw new Error("type is required");

  const ref = doc(
    db,
    "clients",
    clientId,
    "construction",
    "requirements",
    requirement.id
  );

  const payload = requirementSchema.parse({
    ...requirement,
    clientId,
    updatedAt: requirement.updatedAt ?? Date.now(),
  });

  await updateDoc(ref, payload);
}

export async function deleteRequirement(
  clientId: string,
  requirementId: string
): Promise<void> {
  const ref = doc(
    db,
    "clients",
    clientId,
    "construction",
    "requirements",
    requirementId
  );
  await deleteDoc(ref);
}
