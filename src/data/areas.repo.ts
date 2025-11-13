import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { z } from "zod";

import { db } from "@/core/firebase";
import { areaSchema, type Area } from "@/domain/validation/areaSchema";
import {
  scopeOfWorkSchema,
  type ScopeOfWork,
} from "@/domain/validation/scopeOfWorkSchema";

const areaArraySchema = z.array(areaSchema);
const scopeArraySchema = z.array(scopeOfWorkSchema);

const globalAreasCollection = () => collection(db, "global/areas");
const clientAreasCollection = (clientId: string) =>
  collection(db, "clients", clientId, "areas");
const clientAreaDoc = (clientId: string, areaId: string) =>
  doc(db, "clients", clientId, "areas", areaId);

const globalScopesCollection = (areaId: string) =>
  collection(db, `global/areas/${areaId}/scopes`);
const clientScopesCollection = (clientId: string, areaId: string) =>
  collection(db, "clients", clientId, "areas", areaId, "scopes");
const clientScopeDoc = (clientId: string, areaId: string, scopeId: string) =>
  doc(db, "clients", clientId, "areas", areaId, "scopes", scopeId);

const sortAreas = (areas: Area[]): Area[] =>
  [...areas].sort((a, b) => {
    const orderA = a.order ?? Number.POSITIVE_INFINITY;
    const orderB = b.order ?? Number.POSITIVE_INFINITY;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.name.localeCompare(b.name);
  });

const sortScopes = (scopes: ScopeOfWork[]): ScopeOfWork[] =>
  [...scopes].sort((a, b) => {
    const orderA = a.order ?? Number.POSITIVE_INFINITY;
    const orderB = b.order ?? Number.POSITIVE_INFINITY;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.name.localeCompare(b.name);
  });

export async function getGlobalAreas(): Promise<Area[]> {
  const snap = await getDocs(globalAreasCollection());
  const raw: unknown[] = snap.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => ({
    id: docSnap.id,
    ...docSnap.data(),
    source: "global" as const,
  }));

  return areaArraySchema.parse(raw);
}

export async function getClientAreas(clientId: string): Promise<Area[]> {
  const snap = await getDocs(clientAreasCollection(clientId));
  const raw: unknown[] = snap.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => ({
    id: docSnap.id,
    ...docSnap.data(),
    source: "client" as const,
  }));

  return areaArraySchema.parse(raw);
}

export async function getAllAreas(clientId: string): Promise<Area[]> {
  const [globalAreas, clientAreas] = await Promise.all([
    getGlobalAreas(),
    getClientAreas(clientId),
  ]);

  const merged = new Map<string, Area>();
  for (const area of globalAreas) {
    merged.set(area.id, area);
  }

  for (const area of clientAreas) {
    merged.set(area.id, area);
  }

  return sortAreas([...merged.values()]);
}

export async function getGlobalScopes(areaId: string): Promise<ScopeOfWork[]> {
  const snap = await getDocs(globalScopesCollection(areaId));
  const raw: unknown[] = snap.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => ({
    id: docSnap.id,
    ...docSnap.data(),
    areaId,
    source: "global" as const,
  }));

  return scopeArraySchema.parse(raw);
}

export async function getClientScopes(
  clientId: string,
  areaId: string
): Promise<ScopeOfWork[]> {
  const snap = await getDocs(clientScopesCollection(clientId, areaId));
  const raw: unknown[] = snap.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => ({
    id: docSnap.id,
    ...docSnap.data(),
    areaId,
    source: "client" as const,
  }));

  return scopeArraySchema.parse(raw);
}

export async function getAllScopes(
  clientId: string,
  areaId: string
): Promise<ScopeOfWork[]> {
  const [globalScopes, clientScopes] = await Promise.all([
    getGlobalScopes(areaId),
    getClientScopes(clientId, areaId),
  ]);

  const merged = new Map<string, ScopeOfWork>();
  for (const scope of globalScopes) {
    merged.set(scope.id, scope);
  }

  for (const scope of clientScopes) {
    merged.set(scope.id, scope);
  }

  return sortScopes([...merged.values()]);
}

export async function createClientArea(
  clientId: string,
  data: unknown
): Promise<void> {
  const parsed = areaSchema.parse({ ...data, source: "client" });
  const ref = clientAreaDoc(clientId, parsed.id);

  await setDoc(ref, parsed, { merge: true });
}

export async function updateClientArea(
  clientId: string,
  areaId: string,
  data: unknown
): Promise<void> {
  const parsed = areaSchema.partial().parse(data);
  const ref = clientAreaDoc(clientId, areaId);

  await setDoc(ref, { ...parsed, id: areaId, source: "client" }, { merge: true });
}

export async function deleteClientArea(clientId: string, areaId: string): Promise<void> {
  await deleteDoc(clientAreaDoc(clientId, areaId));
}

export async function createClientScope(
  clientId: string,
  areaId: string,
  data: unknown
): Promise<void> {
  const parsed = scopeOfWorkSchema.parse({ ...data, areaId, source: "client" });
  const ref = clientScopeDoc(clientId, areaId, parsed.id);

  await setDoc(ref, parsed, { merge: true });
}

export async function updateClientScope(
  clientId: string,
  areaId: string,
  scopeId: string,
  data: unknown
): Promise<void> {
  const parsed = scopeOfWorkSchema.partial().parse(data);
  const ref = clientScopeDoc(clientId, areaId, scopeId);

  await setDoc(
    ref,
    { ...parsed, id: scopeId, areaId, source: "client" },
    { merge: true }
  );
}

export async function deleteClientScope(
  clientId: string,
  areaId: string,
  scopeId: string
): Promise<void> {
  await deleteDoc(clientScopeDoc(clientId, areaId, scopeId));
}
