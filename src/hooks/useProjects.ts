"use client";
import { useEffect, useState } from "react";
import { listProjects, getProject } from "@/data/projects.repo";
import type { Project } from "@/domain/models";
export function useProjects() {
 const [items, setItems] = useState<Project[]>([]);
 useEffect(() => { listProjects().then(setItems); }, []);
 return items;
}
export function useProject(projectId?: string) {
 const [item, setItem] = useState<Project | null>(null);
 useEffect(() => { if (projectId) getProject(projectId).then(setItem); }, [projectId]);
 return item;
}