import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { buttonVariants } from "@/components/ui/button";
import { uploadImage } from "../utils/uploadImage";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import DesignerCard from "../components/DesignerCard";
import { cn } from "../lib/utils";
import { 
  LayoutDashboard, 
  Layers, 
  Briefcase, 
  Heart, 
  Settings, 
  LogOut, 
  DollarSign, 
  Star, 
  Eye, 
  Upload, 
  CheckCircle,
  Clock,
  ExternalLink
} from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  photo: string;
  bio: string;
  skills: string[];
  rate: number;
  location: string;
  portfolioLinks: {
    github: string;
    behance: string;
    dribbble: string;
  };
  specialty?: string;
  viewsCount?: number;
  subscriptionTier?: string;
  isVerified?: boolean;
  createdAt?: string;
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category?: string;
  designerId?: string;
}

type TabType = "overview" | "projects" | "proposals" | "saved" | "settings";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile Form states
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [bio, setBio] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [rate, setRate] = useState<number>(0);
  const [location, setLocation] = useState("");
  const [github, setGithub] = useState("");
  const [behance, setBehance] = useState("");
  const [dribbble, setDribbble] = useState("");
  const [specialty, setSpecialty] = useState("UI/UX");
  const [subscriptionTier, setSubscriptionTier] = useState("free");
  const [isVerified, setIsVerified] = useState(false);

  // Project Upload states
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [uploadingProject, setUploadingProject] = useState(false);

  // Hire Requests state
  const [hireRequests, setHireRequests] = useState<any[]>([]);

  // Saved Designers state
  const [savedDesigners, setSavedDesigners] = useState<any[]>([]);

  // Reviews state for analytics
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        // Fetch profile
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as ProfileData;
          setProfile(data);
          setName(data.name || "");
          setPhoto(data.photo || "");
          setBio(data.bio || "");
          setSkillsInput(data.skills ? data.skills.join(", ") : "");
          setRate(data.rate || 0);
          setLocation(data.location || "");
          setGithub(data.portfolioLinks?.github || "");
          setBehance(data.portfolioLinks?.behance || "");
          setDribbble(data.portfolioLinks?.dribbble || "");
          setSpecialty(data.specialty || "UI/UX");
          setSubscriptionTier(data.subscriptionTier || "free");
          setIsVerified(data.isVerified || false);
        } else {
          setActiveTab("settings");
        }

        // Fetch projects
        await fetchUserProjects();

        // Fetch hire requests
        await fetchHireRequests();

        // Fetch saved designers
        await fetchSavedDesigners();

        // Fetch reviews
        await fetchReviews();
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to fetch dashboard information.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const fetchUserProjects = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "projects"), where("designerId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const list: ProjectData[] = [];
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
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchHireRequests = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "hireRequests"), where("designerId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHireRequests(list);
    } catch (err) {
      console.error("Error fetching hire requests:", err);
    }
  };

  const handleRequestStatus = async (requestId: string, nextStatus: string) => {
    try {
      const docRef = doc(db, "hireRequests", requestId);
      await updateDoc(docRef, { status: nextStatus });
      setSuccess(`Proposal status updated to ${nextStatus}.`);
      await fetchHireRequests();

      // Trigger notification for the client
      const requestSnap = await getDoc(docRef);
      if (requestSnap.exists()) {
        const reqData = requestSnap.data();
        await addDoc(collection(db, "notifications"), {
          userId: reqData.clientId || "anonymous",
          type: "hire_status",
          message: `Your hire request proposal to ${profile?.name || 'Designer'} was ${nextStatus}`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Error changing status:", err);
      setError("Failed to update status.");
    }
  };

  const fetchSavedDesigners = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "savedDesigners"), where("saverId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      for (const dDoc of querySnapshot.docs) {
        const designerId = dDoc.data().designerId;
        const profileSnap = await getDoc(doc(db, "users", designerId));
        if (profileSnap.exists()) {
          list.push({
            id: designerId,
            ...profileSnap.data(),
          });
        }
      }
      setSavedDesigners(list);
    } catch (err) {
      console.error("Error fetching saved designers:", err);
    }
  };

  const fetchReviews = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "reviews"), where("designerId", "==", user.uid));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach((d) => {
        list.push(d.data());
      });
      setReviews(list);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleRequestVerification = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { isVerified: true });
      setIsVerified(true);
      if (profile) {
        setProfile({ ...profile, isVerified: true });
      }
      setSuccess("Your identity and portfolio have been verified! Verified badge active.");
    } catch (err) {
      console.error(err);
      setError("Failed to request verification.");
    }
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    setUploadingPhoto(true);
    setError("");
    try {
      const url = await uploadImage(file);
      setPhoto(url);
      setSuccess("Profile photo uploaded to Cloudinary!");
    } catch (err: any) {
      console.error("Error uploading photo:", err);
      setError("Failed to upload profile photo to Cloudinary.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) return;

    const parsedSkills = skillsInput
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== "");

    const newProfile: ProfileData = {
      name,
      email: user.email || "",
      photo: photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || user.email || "Lanzy")}&radius=0`,
      bio,
      skills: parsedSkills,
      rate: Number(rate) || 0,
      location,
      portfolioLinks: {
        github,
        behance,
        dribbble,
      },
      specialty,
      subscriptionTier,
      isVerified,
    };

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, { ...newProfile });
      } else {
        await setDoc(docRef, {
          ...newProfile,
          createdAt: new Date().toISOString(),
        });
      }

      setProfile(newProfile);
      setSuccess("Profile saved successfully!");
      setActiveTab("overview");
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to save profile.");
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) return;
    if (!projectFile) {
      return setError("Please select a showcase image or media file.");
    }
    
    // Check Project Count limit for Free Tier
    if ((profile?.subscriptionTier || "free") === "free" && projects.length >= 5) {
      return setError("You have reached the limit of 5 projects for the Free Plan. Please upgrade to Pro or Agency in your profile settings!");
    }

    setUploadingProject(true);
    try {
      const imageUrl = await uploadImage(projectFile);

      await addDoc(collection(db, "projects"), {
        title: projectTitle,
        description: projectDescription,
        imageUrl,
        category: "UI/UX", // Default category for quick submissions
        designerId: user.uid,
        createdAt: new Date().toISOString(),
      });

      setSuccess(`Project "${projectTitle}" uploaded successfully!`);
      setProjectTitle("");
      setProjectDescription("");
      setProjectFile(null);

      await fetchUserProjects();
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError(err.message || "Failed to upload project.");
    } finally {
      setUploadingProject(false);
    }
  };

  const handleProjectDelete = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to remove this project?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteDoc(doc(db, "projects", projectId));
      setSuccess("Project deleted.");
      await fetchUserProjects();
    } catch (err: any) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project.");
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "5.0";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black text-neutral-900 dark:text-white transition-colors duration-300">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 dark:border-neutral-800 border-t-brand-primary"></div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const sidebarLinks = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
    { id: "projects", label: "Portfolio", icon: <Layers className="size-4" /> },
    { id: "proposals", label: "Hire Proposals", icon: <Briefcase className="size-4" /> },
    { id: "saved", label: "Bookmarks", icon: <Heart className="size-4" /> },
    { id: "settings", label: "SaaS Settings", icon: <Settings className="size-4" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white antialiased transition-colors duration-300">
      <Navbar />
      
      <div className="w-full px-4 md:px-8 pt-28 pb-16">
        
        {/* Alerts */}
        <div className="mb-6 max-w-5xl mx-auto">
          {error && (
            <div className="rounded-none bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-900 p-4 text-sm text-red-650 dark:text-red-400 mb-4 animate-in fade-in">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-none bg-green-50 border border-green-200 dark:bg-green-950/40 dark:border-green-900 p-4 text-sm text-green-650 dark:text-green-400 mb-4 animate-in fade-in">
              {success}
            </div>
          )}
        </div>

        {/* Dashboard Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto">
          
          {/* LEFT COLUMN: Sidebar Navigation */}
          <aside className="lg:col-span-3 rounded-none border border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/40 p-4 backdrop-blur-xl space-y-4">
            {profile && (
              <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-900 pb-4 mb-2">
                <img 
                  src={profile.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`} 
                  alt="Avatar" 
                  className="size-10 rounded-none object-cover border border-neutral-200 dark:border-neutral-800"
                />
                <div className="text-left">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white truncate max-w-40">{profile.name}</h3>
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">{profile.specialty || "Designer"}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {sidebarLinks.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id);
                      setError("");
                      setSuccess("");
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-left transition-colors cursor-pointer rounded-none",
                      isActive
                        ? "bg-brand-primary text-white"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    )}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </button>
                );
              })}

              <hr className="border-neutral-200 dark:border-neutral-900 my-2" />

              {profile && (
                <Link
                  to={`/designer/${user?.uid}`}
                  className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-none"
                >
                  <ExternalLink className="size-4" />
                  <span>Public Page</span>
                </Link>
              )}

              <button
                onClick={() => logout()}
                className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-left cursor-pointer rounded-none"
              >
                <LogOut className="size-4" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>

          {/* RIGHT COLUMN: Active Panel Workspace */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border border-neutral-200 dark:border-neutral-900 bg-neutral-50/40 dark:bg-neutral-950/30 p-5 rounded-none text-left">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 flex items-center gap-1"><Eye className="size-3.5" /> Views</span>
                    <span className="text-2xl font-extrabold text-neutral-900 dark:text-white">{profile?.viewsCount || 0}</span>
                  </div>
                  <div className="border border-neutral-200 dark:border-neutral-900 bg-neutral-50/40 dark:bg-neutral-950/30 p-5 rounded-none text-left">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 flex items-center gap-1"><Briefcase className="size-3.5" /> Proposals</span>
                    <span className="text-2xl font-extrabold text-neutral-900 dark:text-white">{hireRequests.length}</span>
                  </div>
                  <div className="border border-neutral-200 dark:border-neutral-900 bg-neutral-50/40 dark:bg-neutral-950/30 p-5 rounded-none text-left">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 flex items-center gap-1"><CheckCircle className="size-3.5" /> Hires</span>
                    <span className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                      {hireRequests.filter((r) => r.status === "completed").length}
                    </span>
                  </div>
                  <div className="border border-neutral-200 dark:border-neutral-900 bg-neutral-50/40 dark:bg-neutral-950/30 p-5 rounded-none text-left">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 flex items-center gap-1"><Star className="size-3.5" /> Rating</span>
                    <span className="text-2xl font-extrabold text-neutral-900 dark:text-white">⭐ {avgRating}</span>
                  </div>
                </div>

                {/* Profile Overview Card */}
                {profile && (
                  <div className="border border-neutral-200 dark:border-neutral-900 bg-neutral-50/30 dark:bg-neutral-950/20 p-6 rounded-none text-left space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">{profile.name}</h2>
                        <p className="text-xs text-neutral-500 mt-1">📍 {profile.location} • Specialty: {profile.specialty}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.isVerified ? (
                          <span className="inline-flex items-center bg-green-50 dark:bg-green-950/25 border border-green-200 dark:border-green-900 px-3 py-1 text-xs text-green-600 dark:text-green-400 font-bold">✓ Verified Account</span>
                        ) : (
                          <button onClick={handleRequestVerification} className="px-3 py-1 border border-neutral-300 hover:border-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-white transition-colors cursor-pointer">
                            Request Verification
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-350 leading-relaxed">{profile.bio}</p>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-900">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="text-[10px] font-semibold text-neutral-600 dark:text-slate-300 bg-neutral-100 dark:bg-neutral-900 px-2 py-1 border border-neutral-200 dark:border-neutral-850">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Proposals Drawer */}
                <div className="border border-neutral-200 dark:border-neutral-900 bg-neutral-50/40 dark:bg-neutral-950/30 p-6 rounded-none text-left space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Recent Work Proposals</h3>
                  
                  {hireRequests.length === 0 ? (
                    <p className="text-neutral-500 text-xs py-4">No proposals received yet.</p>
                  ) : (
                    <div className="divide-y divide-neutral-200 dark:divide-neutral-900">
                      {hireRequests.slice(0, 3).map((request) => (
                        <div key={request.id} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-neutral-900 dark:text-white">{request.clientName}</span>
                              <span className={cn(
                                "text-[9px] font-bold uppercase px-1.5 py-0.2 border",
                                request.status === "accepted" ? "text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-950 dark:bg-green-950/10" :
                                request.status === "declined" ? "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-950 dark:bg-red-950/10" :
                                "text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-950 dark:bg-amber-950/10"
                              )}>
                                {request.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 line-clamp-1 mt-1">{request.message}</p>
                          </div>
                          <span className="text-[10px] text-neutral-400">{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PORTFOLIO TAB */}
            {activeTab === "projects" && (
              <div className="space-y-8 animate-in fade-in duration-200 text-left">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Upload Form */}
                  <div className="md:col-span-1">
                    <form onSubmit={handleProjectSubmit} className="space-y-4 rounded-none border border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/30 p-6 backdrop-blur-xl">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-2">Publish Project</h3>
                      
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">Project Title</label>
                        <input
                          type="text"
                          required
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          className="w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary"
                          placeholder="e.g. Mobile E-Shop"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">Description</label>
                        <textarea
                          rows={3}
                          required
                          value={projectDescription}
                          onChange={(e) => setProjectDescription(e.target.value)}
                          className="w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary"
                          placeholder="Project milestones, design patterns..."
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">Showcase Image</label>
                        <div className="mt-1 border border-dashed border-neutral-300 dark:border-neutral-800 p-4 text-center hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors relative">
                          <input
                            type="file"
                            required
                            accept="image/*"
                            onChange={(e) => setProjectFile(e.target.files ? e.target.files[0] : null)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <Upload className="size-6 text-neutral-400 mx-auto mb-2" />
                          <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                            {projectFile ? projectFile.name : "Select Image File"}
                          </span>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={uploadingProject} 
                        className={cn(buttonVariants({ variant: 'default', className: 'w-full text-xs font-semibold py-2 cursor-pointer' }))}
                      >
                        {uploadingProject ? "Uploading..." : "Publish Project"}
                      </button>

                      {/* Display Limit Status */}
                      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-900">
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block text-center">
                          Limit: {projects.length} / 5 projects (Free plan)
                        </span>
                      </div>
                    </form>
                  </div>

                  {/* Portfolio list grid */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Active Projects ({projects.length})</h3>
                    
                    {projects.length === 0 ? (
                      <div className="text-center py-20 rounded-none border border-dashed border-neutral-200 dark:border-neutral-900 text-neutral-550 bg-neutral-50/20 dark:bg-neutral-950/10">
                        No projects published yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {projects.map((project) => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            onDelete={handleProjectDelete}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* HIRE PROPOSALS TAB */}
            {activeTab === "proposals" && (
              <div className="border border-neutral-200 dark:border-neutral-900 bg-neutral-50/40 dark:bg-neutral-950/30 p-6 rounded-none text-left space-y-4 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-2">Incoming Client Proposals</h3>
                
                {hireRequests.length === 0 ? (
                  <p className="text-neutral-550 dark:text-neutral-500 text-xs py-8 text-center">No proposals received yet.</p>
                ) : (
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-900">
                    {hireRequests.map((request) => (
                      <div key={request.id} className="py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-neutral-900 dark:text-white">{request.clientName}</span>
                            <span className="text-xs text-neutral-500">({request.clientEmail})</span>
                            <span className={cn(
                              "text-[9px] font-extrabold uppercase px-2 py-0.5 border",
                              request.status === "accepted" ? "text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-950 dark:bg-green-950/10" :
                              request.status === "declined" ? "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-950 dark:bg-red-950/10" :
                              "text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-950 dark:bg-amber-950/10"
                            )}>
                              {request.status}
                            </span>
                          </div>
                          
                          <p className="text-xs text-neutral-600 dark:text-slate-300 max-w-xl leading-relaxed">{request.message}</p>
                          
                          <div className="flex flex-wrap gap-4 text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                            <span className="flex items-center gap-1"><DollarSign className="size-3.5 text-brand-primary" /> Budget: ${request.budget}</span>
                            <span className="flex items-center gap-1"><Clock className="size-3.5 text-brand-primary" /> Timeline: {request.timeline}</span>
                          </div>
                        </div>

                        {request.status === "pending" && (
                          <div className="flex items-center gap-2 self-start md:self-center">
                            <button
                              onClick={() => handleRequestStatus(request.id, "accepted")}
                              className={cn(buttonVariants({ variant: 'default', size: 'sm', className: 'text-xs cursor-pointer' }))}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRequestStatus(request.id, "declined")}
                              className={cn(buttonVariants({ variant: 'destructive', size: 'sm', className: 'text-xs cursor-pointer' }))}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BOOKMARKS TAB */}
            {activeTab === "saved" && (
              <div className="border border-neutral-200 dark:border-neutral-900 bg-neutral-50/40 dark:bg-neutral-950/30 p-6 rounded-none text-left space-y-4 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-2">Bookmarked Designers</h3>
                
                {savedDesigners.length === 0 ? (
                  <p className="text-neutral-550 dark:text-neutral-500 text-xs py-8 text-center">No saved designers yet. Explore the directory to bookmark creative talent!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {savedDesigners.map((designer) => (
                      <DesignerCard key={designer.id} designer={designer} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <form onSubmit={handleProfileSave} className="space-y-6 rounded-none border border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/30 p-6 backdrop-blur-xl text-left animate-in fade-in duration-200">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-3">
                  {profile ? "Edit Your Professional Profile" : "Create Your Designer Profile"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary text-xs"
                      placeholder="e.g. hamenath"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Profile Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoUpload}
                      className="block w-full text-xs text-neutral-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-none file:border file:border-neutral-200 dark:file:border-neutral-800 file:text-[10px] file:font-semibold file:bg-neutral-100 dark:file:bg-neutral-850 file:text-neutral-700 dark:file:text-white cursor-pointer"
                    />
                    {uploadingPhoto && <span className="text-[10px] text-neutral-500 block mt-1 animate-pulse">Uploading photo to Cloudinary...</span>}
                    {photo && (
                      <div className="mt-2 flex items-center gap-3">
                        <img src={photo} alt="Avatar Preview" className="h-8 w-8 rounded-none object-cover border border-neutral-200 dark:border-neutral-800" />
                        <span className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">Ready to save</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Bio</label>
                    <textarea
                      rows={4}
                      required
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="block w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary text-xs"
                      placeholder="Brief pitch about yourself, design styles, and goals..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Skills (comma-separated)</label>
                    <input
                      type="text"
                      required
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      className="block w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary text-xs"
                      placeholder="UI/UX, Web Design, Figma, Logo Design"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Hourly Rate ($ / hr)</label>
                    <input
                      type="number"
                      required
                      value={rate || ""}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="block w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary text-xs"
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Location</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="block w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary text-xs"
                      placeholder="San Francisco, CA"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Specialty Category</label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="block w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary text-xs"
                    >
                      <option value="UI/UX">UI/UX</option>
                      <option value="Logo Design">Logo Design</option>
                      <option value="Branding">Branding</option>
                      <option value="Web Design">Web Design</option>
                      <option value="Illustration">Illustration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Github Profile URL</label>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="block w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary text-xs"
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Behance Portfolio URL</label>
                    <input
                      type="text"
                      value={behance}
                      onChange={(e) => setBehance(e.target.value)}
                      className="block w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary text-xs"
                      placeholder="https://behance.net/username"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Dribbble Profile URL</label>
                    <input
                      type="text"
                      value={dribbble}
                      onChange={(e) => setDribbble(e.target.value)}
                      className="block w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary text-xs"
                      placeholder="https://dribbble.com/username"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Subscription Plan</label>
                    <select
                      value={subscriptionTier}
                      onChange={(e) => setSubscriptionTier(e.target.value)}
                      className="block w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary text-xs"
                    >
                      <option value="free">Free Tier - Basic profile (5 projects limit)</option>
                      <option value="pro">Pro Tier - Unlimited projects, Verified check</option>
                      <option value="agency">Agency Tier - Unlimited projects, Team tools</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-900">
                  <button 
                    type="submit" 
                    className={cn(buttonVariants({ variant: 'default', className: 'text-xs font-semibold py-2 cursor-pointer' }))}
                  >
                    Save Profile Settings
                  </button>
                  {profile && (
                    <button 
                      type="button" 
                      onClick={() => setActiveTab("overview")}
                      className={cn(buttonVariants({ variant: 'outline', className: 'text-xs font-semibold py-2 cursor-pointer' }))}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

          </main>
        </div>

      </div>
    </div>
  );
}
