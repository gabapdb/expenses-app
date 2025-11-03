"use client";

import { useEffect, useState } from "react";
import { db } from "@/core/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { z } from "zod";

/* ────────────────────────────────
 * 1️⃣ ZOD SCHEMA
 * ──────────────────────────────── */
export const ProjectZod = z.object({
  id: z.string(),
  name: z.string(),
  team: z.string().optional(),
  projectCost: z.number().optional().default(0),
  developer: z.string().optional(),
  city: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  projectSize: z.string().optional(),
  createdAt: z.number().optional(),
});

export type Project = z.infer<typeof ProjectZod>;

/* ────────────────────────────────
 * 2️⃣ STATE TYPES
 * ──────────────────────────────── */
export interface ProjectListState {
  data: Project[];
  loading: boolean;
  error: string | null;
}

export interface ProjectState {
  data: Project | null;
  loading: boolean;
  error: string | null;
}

/* ────────────────────────────────
 * 3️⃣ useProjects() → all projects
 * ──────────────────────────────── */
export function useProjects(): ProjectListState {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("name", "asc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        try {
          const parsed = snapshot.docs.map((docSnap) =>
            ProjectZod.parse({ id: docSnap.id, ...docSnap.data() })
          );
          setData(parsed);
        } catch (err) {
          console.error("[useProjects] Zod validation error:", err);
          setError("Invalid project data format.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("[useProjects] Firestore error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { data, loading, error };
}

/* ────────────────────────────────
 * 4️⃣ useProject(id) → single project
 * ──────────────────────────────── */
export function useProject(projectId?: string): ProjectState {
  const [data, setData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const ref = doc(db, "projects", projectId);

    const unsub = onSnapshot(
      ref,
      (docSnap) => {
        if (!docSnap.exists()) {
          setData(null);
          setLoading(false);
          return;
        }

        try {
          const parsed = ProjectZod.parse({
            id: docSnap.id,
            ...docSnap.data(),
          });
          setData(parsed);
        } catch (err) {
          console.error("[useProject] Zod validation error:", err);
          setError("Invalid project format.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("[useProject] Firestore error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [projectId]);

  return { data, loading, error };
}
