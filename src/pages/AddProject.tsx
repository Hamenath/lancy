import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { collection, addDoc, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { uploadImage } from "../utils/uploadImage";
import { Button } from "@/components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AddProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("UI/UX");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      return setError("You must be logged in to upload a project.");
    }
    if (!imageFile) {
      return setError("Please select a project showcase image.");
    }

    setUploading(true);
    try {
      // Check upload limit for Free Tier users
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const tier = userData?.subscriptionTier || "free";
      if (tier === "free") {
        const q = query(
          collection(db, "projects"),
          where("designerId", "==", user.uid)
        );
        const snap = await getDocs(q);
        if (snap.size >= 5) {
          setUploading(false);
          return setError("You have reached the limit of 5 projects for the Free Plan. Please upgrade in your Dashboard settings!");
        }
      }
      // 1. Upload project image to Cloudinary
      const imageUrl = await uploadImage(imageFile);

      // 2. Save metadata to Firestore projects collection
      await addDoc(collection(db, "projects"), {
        title,
        description,
        imageUrl,
        category,
        designerId: user.uid,
        createdAt: new Date().toISOString(),
      });

      setSuccess("Project uploaded successfully!");
      // Reset form
      setTitle("");
      setDescription("");
      setImageFile(null);
      
      // Redirect to My Projects page after 1.5 seconds
      setTimeout(() => {
        navigate("/my-projects");
      }, 1500);
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError(err.message || "Failed to upload project. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white antialiased flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-xl mx-auto px-6 pt-32 pb-12">
          <div className="border border-neutral-900 bg-neutral-950/30 p-8 backdrop-blur-xl rounded-none">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-4 mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight">Upload Portfolio Project</h1>
              <Link to="/my-projects" className="text-xs text-neutral-400 hover:text-white transition-colors">
                View My Projects
              </Link>
            </div>

            {error && (
              <div className="mb-6 rounded-none bg-red-950/50 border border-red-900 p-4 text-xs text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-none bg-green-950/50 border border-green-900 p-4 text-xs text-green-400">
                {success}
              </div>
            )}

            <form onSubmit={handleProjectSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Brand Identity"
                  className="block w-full rounded-none border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full rounded-none border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                >
                  <option value="UI/UX">UI/UX</option>
                  <option value="Logo Design">Logo Design</option>
                  <option value="Branding">Branding</option>
                  <option value="Web Design">Web Design</option>
                  <option value="Illustration">Illustration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the logo, branding package, typography selection, or UI redesign details..."
                  className="block w-full rounded-none border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Showcase Image</label>
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-750 cursor-pointer"
                />
              </div>

              <Button
                type="submit"
                disabled={uploading}
                className="w-full text-xs py-2.5 bg-white text-black hover:bg-neutral-200 rounded-none font-bold tracking-tight uppercase"
              >
                {uploading ? "Uploading project..." : "Publish Project"}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
