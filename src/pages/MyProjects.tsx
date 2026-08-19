import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import ProjectCard from "../components/ProjectCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category?: string;
  designerId?: string;
}

export default function MyProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchUserProjects() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "projects"),
          where("designerId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const list: Project[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            title: data.title || "",
            description: data.description || "",
            imageUrl: data.imageUrl || "",
            category: data.category || "",
            designerId: data.designerId || "",
          });
        });
        setProjects(list);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError("Failed to fetch your projects.");
      } finally {
        setLoading(false);
      }
    }

    fetchUserProjects();
  }, [user]);

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteDoc(doc(db, "projects", id));
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setSuccess("Project deleted successfully.");
    } catch (err: any) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project.");
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-neutral-900 flex-col space-y-4">
        <p>Please log in to manage your portfolio.</p>
        <Link to="/login" className="text-sm text-blue-400 hover:underline">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-neutral-900 antialiased flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="w-full px-4 md:px-8 pt-32 pb-12">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-neutral-900 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">My Portfolio Projects</h1>
              <p className="text-sm text-neutral-400 mt-1">Manage the showcase projects displayed on your profile</p>
            </div>
            <Link
              to="/add-project"
              className="inline-flex justify-center items-center bg-white text-black hover:bg-neutral-200 px-5 py-2 text-xs font-bold rounded-none uppercase transition-colors"
            >
              Add New Project
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

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-800 border-t-white"></div>
            </div>
          ) : (
            <>
              {projects.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-900 rounded-none text-neutral-500">
                  <p className="text-sm mb-4">No portfolio projects uploaded yet.</p>
                  <Link to="/add-project" className="text-xs text-blue-400 hover:underline">
                    Upload your first project showcase
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onDelete={handleDeleteProject}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
