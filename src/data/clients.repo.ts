import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { z } from "zod";

import { db } from "@/core/firebase";
import { clientSchema, type Client } from "@/domain/validation/clientSchema";

const clientsCollection = () => collection(db, "clients");
const clientsArraySchema = z.array(clientSchema);

export async function getClient(clientId: string): Promise<Client | null> {
  const ref = doc(db, "clients", clientId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  const parsed = clientSchema.safeParse({ id: snap.id, ...snap.data() });
  if (!parsed.success) {
    console.error("[ClientsRepo] Invalid document:", parsed.error.flatten());
    return null;
  }

  return parsed.data;
}

export async function getClients(): Promise<Client[]> {
  const snap = await getDocs(clientsCollection());
  const raw: unknown[] = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
    id: d.id,
    ...d.data(),
  }));

  return clientsArraySchema.parse(raw);
}

export async function createClient(data: unknown): Promise<void> {
  const parsed = clientSchema.parse(data);
  const ref = doc(db, "clients", parsed.id);

  await setDoc(ref, parsed, { merge: true });
}

export async function updateClient(clientId: string, data: unknown): Promise<void> {
  const parsed = clientSchema.partial().parse(data);
  const ref = doc(db, "clients", clientId);

  await setDoc(ref, parsed, { merge: true });
}

export async function deleteClient(clientId: string): Promise<void> {
  const ref = doc(db, "clients", clientId);
  await deleteDoc(ref);
}
