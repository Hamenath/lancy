import { db } from "../firebase/config";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  setDoc, 
  deleteDoc, 
  limit 
} from "firebase/firestore";
import type { Freelancer } from "../types";

export const freelancerService = {
  async getAllFreelancers(): Promise<Freelancer[]> {
    if (!db || !db.app) return [];
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const freelancers: Freelancer[] = [];

      for (const docSnap of usersSnap.docs) {
        const userData = docSnap.data();
        const userId = docSnap.id;

        // Ratings calculation
        const revQuery = query(collection(db, "reviews"), where("designerId", "==", userId));
        const revSnap = await getDocs(revQuery);
        let totalRating = 0;
        revSnap.forEach((rDoc) => {
          totalRating += rDoc.data().rating || 0;
        });
        const avgRating = revSnap.size > 0 ? totalRating / revSnap.size : 5.0;

        // Portfolio preview
        const projQuery = query(collection(db, "projects"), where("designerId", "==", userId), limit(1));
        const projSnap = await getDocs(projQuery);
        let portfolioUrl = "https://images.unsplash.com/photo-1541462608141-2ffb68df685e?auto=format&fit=crop&q=80&w=500";
        let portfolioTitle = "No portfolio showcase uploaded";
        if (!projSnap.empty) {
          const projData = projSnap.docs[0].data();
          portfolioUrl = projData.imageUrl || portfolioUrl;
          portfolioTitle = projData.title || portfolioTitle;
        }

        freelancers.push({
          id: userId,
          name: userData.name || "Creative Professional",
          role: userData.specialty || "Freelancer Specialist",
          photo: userData.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name || "U")}&radius=0&backgroundColor=000000&textColor=ffffff`,
          bio: userData.bio || "",
          rating: avgRating,
          reviewsCount: revSnap.size,
          skills: userData.skills || ["Figma", "Design Systems"],
          rate: userData.rate || 50,
          location: userData.location || "Remote",
          portfolioUrl,
          portfolioTitle,
          isVerified: userData.isVerified || false
        });
      }
      return freelancers;
    } catch (err) {
      console.error("Error fetching freelancers:", err);
      return [];
    }
  },

  async getFreelancerById(id: string): Promise<Freelancer | null> {
    if (!db || !db.app) return null;
    try {
      const userRef = doc(db, "users", id);
      const snap = await getDoc(userRef);
      if (!snap.exists()) return null;
      const userData = snap.data();
      return {
        id: snap.id,
        name: userData.name || "Creative Professional",
        role: userData.specialty || "Freelancer Specialist",
        photo: userData.photo || "",
        bio: userData.bio || "",
        skills: userData.skills || [],
        rate: userData.rate || 0,
        location: userData.location || "Remote",
        rating: userData.rating || 5.0,
        reviewsCount: userData.reviewsCount || 0,
        isVerified: userData.isVerified || false
      };
    } catch (err) {
      console.error("Error fetching freelancer profile:", err);
      return null;
    }
  },

  async isFavorite(userId: string, freelancerId: string): Promise<boolean> {
    if (!db || !db.app) return false;
    try {
      const favRef = doc(db, "favorites", `${userId}_${freelancerId}`);
      const snap = await getDoc(favRef);
      return snap.exists();
    } catch (e) {
      return false;
    }
  },

  async toggleFavorite(userId: string, freelancerId: string, currentlySaved: boolean): Promise<boolean> {
    if (!db || !db.app) return false;
    const favRef = doc(db, "favorites", `${userId}_${freelancerId}`);
    if (currentlySaved) {
      await deleteDoc(favRef);
      return false;
    } else {
      await setDoc(favRef, {
        userId,
        freelancerId,
        createdAt: new Date().toISOString()
      });
      return true;
    }
  }
};
