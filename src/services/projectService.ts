import { db } from "../firebase/config";
import { 
  collection, 
  getDocs, 
  doc, 
  query, 
  where, 
  addDoc, 
  deleteDoc 
} from "firebase/firestore";
import { apiFetch } from "./apiConfig";
import type { Project } from "../types";

export type { Project };

export const projectService = {
  async getAllProjects(category?: string): Promise<Project[]> {
    const endpoint = category ? `/projects?category=${encodeURIComponent(category)}` : '/projects';
    const apiData = await apiFetch<Project[]>(endpoint);
    if (apiData && Array.isArray(apiData)) {
      return apiData;
    }
    return [];
  },

  async getProjectsByFreelancer(freelancerId: string): Promise<Project[]> {
    if (!db || !db.app) return [];
    try {
      const q = query(collection(db, "projects"), where("designerId", "==", freelancerId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Project, "id">)
      }));
    } catch (err) {
      console.error("Error fetching projects:", err);
      return [];
    }
  },

  async addProject(projectData: Omit<Project, "id">): Promise<string> {
    const apiRes = await apiFetch<{ id: string }>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    if (apiRes && apiRes.id) {
      return apiRes.id;
    }

    if (!db || !db.app) throw new Error("Database not connected");
    const docRef = await addDoc(collection(db, "projects"), {
      ...projectData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  },

  async deleteProject(id: string): Promise<void> {
    if (!db || !db.app) throw new Error("Database not connected");
    await deleteDoc(doc(db, "projects", id));
  }
};
