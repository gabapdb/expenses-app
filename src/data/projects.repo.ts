import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/core/firebase";
import { ProjectSchema, type Project } from "@/domain/models";
import { z } from "zod";

/**
 * Zod-safe schema array for Projects
 */
const ProjectsArraySchema = z.array(ProjectSchema);

const colRef = () => collection(db, "projects");

/**
 * Lists all projects, Zod-validating each document.
 */
export async function listProjects(): Promise<Project[]> {
  const snap = await getDocs(colRef());
  const raw: unknown[] = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
    id: d.id,
    ...d.data(),
  }));
  return ProjectsArraySchema.parse(raw);
}

/**
 * Fetches one project by ID, returning `null` if not found.
 */
export async function getProject(projectId: string): Promise<Project | null> {
  const ref = doc(db, "projects", projectId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const parsed = ProjectSchema.safeParse({ id: snap.id, ...snap.data() });
  if (!parsed.success) {
    console.error("[ProjectsRepo] Invalid document:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

/**
 * Upserts (creates or merges) a project document.
 */
export async function upsertProject(p: Project): Promise<void> {
  const parsed = ProjectSchema.parse(p); // ✅ Ensure schema compliance before write
  const ref = doc(db, "projects", parsed.id);
  await setDoc(ref, parsed, { merge: true });
}
