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
import type { Project } from "../types";

export const projectService = {
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
