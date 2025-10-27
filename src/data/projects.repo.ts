import { collection, doc, getDoc, getDocs, setDoc, type DocumentData } from "firebase/firestore";
import { db } from "@/core/firebase";
import { mapProject } from "@/domain/mapping";
import type { Project } from "@/domain/models";


const col = () => collection(db, "projects");
export async function listProjects(): Promise<Project[]> {
const snap = await getDocs(col());
return snap.docs.map(d => mapProject(d.id, d.data() as DocumentData));
}
export async function getProject(projectId: string): Promise<Project | null> {
const ref = doc(db, "projects", projectId);
const snap = await getDoc(ref);
return snap.exists() ? mapProject(snap.id, snap.data() as DocumentData) : null;
}
export async function upsertProject(p: Project): Promise<void> {
const ref = doc(db, "projects", p.id);
await setDoc(ref, p, { merge: true });
}