import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc } from "firebase/firestore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProjectCard from "../components/ProjectCard";
import { useAuth } from "../context/AuthContext";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";
import { Globe, Star, Mail, MessageSquare, Briefcase, MapPin, DollarSign, Award } from "lucide-react";

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

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
  viewsCount?: number;
  isVerified?: boolean;
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category?: string;
  designerId?: string;
  createdAt: string;
}

export default function DesignerProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter project categories
  const [selectedProjCategory, setSelectedProjCategory] = useState("");

  // Hire Modal states
  const [showHireModal, setShowHireModal] = useState(false);
  const [clientName, setClientName] = useState(user?.displayName || "");
  const [clientEmail, setClientEmail] = useState(user?.email || "");
  const [hireMessage, setHireMessage] = useState("");
  const [hireBudget, setHireBudget] = useState("");
  const [hireTimeline, setHireTimeline] = useState("");
  const [submittingHire, setSubmittingHire] = useState(false);
  const [hireSuccess, setHireSuccess] = useState("");
  const [hireError, setHireError] = useState("");

  // Reviews states
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !profile) return;
    setSubmittingHire(true);
    setHireError("");
    setHireSuccess("");
    try {
      await addDoc(collection(db, "hireRequests"), {
        clientId: user?.uid || "anonymous",
        clientName,
        clientEmail,
        designerId: id,
        designerName: profile.name,
        message: hireMessage,
        budget: hireBudget,
        timeline: hireTimeline,
        status: "pending",
        createdAt: new Date().toISOString()
      });

      // Notify the designer
      await addDoc(collection(db, "notifications"), {
        userId: id,
        type: "hire_request",
        message: `You received a new hire request from ${clientName}`,
        read: false,
        createdAt: new Date().toISOString()
      });

      setHireSuccess("Your hire request was sent successfully!");
      setHireMessage("");
      setHireBudget("");
      setHireTimeline("");
      setTimeout(() => {
        setShowHireModal(false);
        setHireSuccess("");
      }, 2000);
    } catch (err: any) {
      console.error("Error sending hire request:", err);
      setHireError("Failed to send hire request. Please try again.");
    } finally {
      setSubmittingHire(false);
    }
  };

  useEffect(() => {
    async function fetchDesignerDetails() {
      if (!id) return;
      try {
        // Fetch User Profile
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data() as ProfileData;
          setProfile(profileData);
          
          // Increment viewsCount
          try {
            await updateDoc(docRef, {
              viewsCount: (profileData.viewsCount || 0) + 1
            });
          } catch (e) {
            console.error("Error updating viewsCount:", e);
          }
        } else {
          setError("Designer profile not found.");
        }

        // Fetch User Projects
        const projectsQuery = query(
          collection(db, "projects"),
          where("designerId", "==", id)
        );
        const querySnapshot = await getDocs(projectsQuery);
        const projectsList: ProjectData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          projectsList.push({
            id: doc.id,
            title: data.title || "",
            description: data.description || "",
            imageUrl: data.imageUrl || "",
            category: data.category || "",
            designerId: data.designerId || "",
            createdAt: data.createdAt || "",
          });
        });
        // Sort projects by date
        projectsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setProjects(projectsList);

        // Fetch Reviews
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("designerId", "==", id)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsList: any[] = [];
        reviewsSnapshot.forEach((doc) => {
          reviewsList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        reviewsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(reviewsList);
      } catch (err: any) {
        console.error("Error fetching designer profile/projects/reviews:", err);
        setError("Failed to load designer information.");
      } finally {
        setLoading(false);
      }
    }

    fetchDesignerDetails();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;
    setSubmittingReview(true);
    setReviewError("");
    try {
      await addDoc(collection(db, "reviews"), {
        designerId: id,
        reviewerId: user.uid,
        reviewerName: user.displayName || user.email || "Client",
        rating: ratingInput,
        comment: reviewComment,
        createdAt: new Date().toISOString()
      });
      setReviewComment("");
      setRatingInput(5);
      
      // Reload reviews
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("designerId", "==", id)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsList: any[] = [];
      reviewsSnapshot.forEach((doc) => {
        reviewsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      reviewsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(reviewsList);
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setReviewError("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getProfileCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.name) score += 15;
    if (profile.photo) score += 15;
    if (profile.bio) score += 20;
    if (profile.skills && profile.skills.length > 0) score += 15;
    if (profile.rate && profile.rate > 0) score += 15;
    if (profile.location) score += 10;
    if (profile.portfolioLinks?.github || profile.portfolioLinks?.behance || profile.portfolioLinks?.dribbble) score += 10;
    return score;
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "5.0"; // Premium initial score

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-neutral-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-primary"></div>
          <p className="text-sm text-neutral-500">Loading profile details...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-neutral-900 flex-col space-y-4">
        <p className="text-red-500">{error || "Profile not found."}</p>
        <Link to="/designers" className="text-sm text-brand-primary hover:underline">
          Back to directory
        </Link>
      </div>
    );
  }

  const completionScore = getProfileCompletion();
  
  // Unique categories of user projects
  const categoriesList = Array.from(new Set(projects.map(p => p.category).filter(Boolean))) as string[];
  const filteredProjects = projects.filter(p => !selectedProjCategory || p.category === selectedProjCategory);

  return (
    <div className="relative min-h-screen bg-white text-neutral-900 antialiased flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Profile Header & Info Banner */}
        <div className="w-full px-4 md:px-8 pt-32 pb-12">
          <div className="rounded-none border border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/45 p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              
              {/* Photo & Basic Info */}
              <img
                src={profile.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name || "U")}&radius=0`}
                alt={profile.name}
                className="h-28 w-28 md:h-32 md:w-32 rounded-none object-cover border border-neutral-250 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shadow-lg"
              />
              
              <div className="flex-1 space-y-5">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2 text-neutral-900 dark:text-white">
                      <span>{profile.name}</span>
                      {profile.isVerified && (
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/15 border border-green-200 dark:border-green-900 px-2 py-0.5 rounded-none">
                          ✓ Verified
                        </span>
                      )}
                    </h1>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-slate-400">
                      <MapPin className="size-3.5 text-brand-primary" />
                      <span>{profile.location || "Remote"}</span>
                    </div>
                  </div>
                </div>

                <p className="text-neutral-600 dark:text-neutral-300 text-sm md:text-base leading-relaxed max-w-2xl">
                  {profile.bio || "No description provided."}
                </p>

                {/* Profile Completion Indicator */}
                <div className="space-y-1.5 bg-neutral-100/60 dark:bg-neutral-900/40 p-3.5 border border-neutral-200/80 dark:border-neutral-900 max-w-md">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><Award className="size-3.5" /> Profile Strength</span>
                    <span>{completionScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-250 dark:bg-neutral-800">
                    <div className="h-full bg-brand-primary transition-all duration-500" style={{ width: `${completionScore}%` }} />
                  </div>
                </div>

                {/* Badges / Metrics */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-none bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-xs text-neutral-800 dark:text-white font-bold">
                    <DollarSign className="size-3.5 text-brand-primary" /> ${profile.rate || "0"}/hr
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-none bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-xs text-neutral-800 dark:text-white font-bold">
                    <Star className="size-3.5 fill-brand-primary text-brand-primary" /> {averageRating} {reviews.length > 0 && `(${reviews.length})`}
                  </span>
                  {profile.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-none bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-2.5 py-1 text-xs text-neutral-600 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Social links & Contact Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-neutral-250 dark:border-neutral-900/60">
                  <div className="flex gap-4 text-xs font-bold uppercase tracking-wider items-center">
                    {profile.portfolioLinks?.github && (
                      <a href={profile.portfolioLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
                        <GithubIcon size={14} /> GitHub
                      </a>
                    )}
                    {profile.portfolioLinks?.behance && (
                      <a href={profile.portfolioLinks.behance} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
                        <Globe className="size-3.5" /> Behance
                      </a>
                    )}
                    {profile.portfolioLinks?.dribbble && (
                      <a href={profile.portfolioLinks.dribbble} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
                        <Globe className="size-3.5" /> Dribbble
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`mailto:${profile.email}`}
                      className="inline-flex justify-center items-center border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 px-5 py-2 rounded-none font-bold text-xs tracking-wider uppercase text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                    >
                      <Mail className="size-3.5 mr-1.5" /> Email
                    </a>
                    <Link
                      to={`/chat/${id}`}
                      className="inline-flex justify-center items-center border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 px-5 py-2 rounded-none font-bold text-xs tracking-wider uppercase text-neutral-700 dark:text-neutral-300 transition-colors"
                    >
                      <MessageSquare className="size-3.5 mr-1.5" /> Message
                    </Link>
                    <button
                      onClick={() => setShowHireModal(true)}
                      className="inline-flex justify-center items-center bg-brand-primary hover:bg-brand-primary-hover text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-5 py-2 rounded-none font-bold text-xs tracking-wider uppercase transition-colors shadow-lg cursor-pointer"
                    >
                      <Briefcase className="size-3.5 mr-1.5" /> Hire Designer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Showcase Showcase section */}
        <div className="w-full px-4 md:px-8 py-12 border-b border-neutral-200 dark:border-neutral-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Project Portfolio</h2>
            
            {/* Project Category tabs */}
            {categoriesList.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedProjCategory("")}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border cursor-pointer ${
                    !selectedProjCategory
                      ? "bg-brand-primary border-brand-primary text-white dark:bg-white dark:text-black dark:border-white"
                      : "bg-neutral-50 dark:bg-neutral-950 text-neutral-500 border-neutral-200 dark:border-neutral-900"
                  }`}
                >
                  All
                </button>
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedProjCategory(cat)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border cursor-pointer ${
                      selectedProjCategory === cat
                        ? "bg-brand-primary border-brand-primary text-white dark:bg-white dark:text-black dark:border-white"
                        : "bg-neutral-50 dark:bg-neutral-950 text-neutral-500 border-neutral-200 dark:border-neutral-900"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20 rounded-none border border-dashed border-neutral-200 dark:border-neutral-900 text-neutral-500 bg-neutral-50/20 dark:bg-neutral-950/10">
              No portfolio projects match selection.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Reviews List */}
          <div className="md:col-span-2 space-y-6 text-left">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Client Reviews</h2>
            
            {reviews.length === 0 ? (
              <p className="text-neutral-550 dark:text-neutral-500 text-xs py-6">No reviews have been written for this designer yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-neutral-200 dark:border-neutral-900 bg-neutral-50/30 dark:bg-neutral-950/20 p-5 rounded-none space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900 dark:text-white">{review.reviewerName}</span>
                        <span className="text-xs text-brand-primary">{"★".repeat(review.rating)}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Review Form */}
          <div className="md:col-span-1 text-left">
            <div className="border border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/30 p-6 backdrop-blur-xl rounded-none space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-2">Leave a Review</h3>
              
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {reviewError && (
                    <div className="rounded-none bg-red-100 border border-red-200 dark:bg-red-950/50 dark:border-red-900 p-3 text-xs text-red-650 dark:text-red-400">
                      {reviewError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Rating</label>
                    <select
                      value={ratingInput}
                      onChange={(e) => setRatingInput(Number(e.target.value))}
                      className="w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary"
                    >
                      <option value="5">5 Stars - Outstanding</option>
                      <option value="4">4 Stars - Very Good</option>
                      <option value="3">3 Stars - Good</option>
                      <option value="2">2 Stars - Disappointed</option>
                      <option value="1">1 Star - Poor Work</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Comment</label>
                    <textarea
                      rows={4}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience working with this designer..."
                      className="w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submittingReview} 
                    className={cn(buttonVariants({ variant: 'default', className: 'w-full text-xs font-semibold py-2 cursor-pointer' }))}
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              ) : (
                <p className="text-xs text-neutral-500">
                  Please{" "}
                  <Link to="/login" className="text-brand-primary hover:underline">
                    log in
                  </Link>{" "}
                  to write a review.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hire Modal */}
      {showHireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-6 rounded-none space-y-6 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-900 pb-3">
              <h3 className="text-md font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Send Proposal to {profile.name}</h3>
              <button onClick={() => setShowHireModal(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-sm cursor-pointer">✕</button>
            </div>

            {hireSuccess && (
              <div className="rounded-none bg-green-50 border border-green-200 dark:bg-green-950/50 dark:border-green-900 p-3 text-xs text-green-650 dark:text-green-400">
                {hireSuccess}
              </div>
            )}

            {hireError && (
              <div className="rounded-none bg-red-50 border border-red-200 dark:bg-red-950/50 dark:border-red-900 p-3 text-xs text-red-650 dark:text-red-400">
                {hireError}
              </div>
            )}

            <form onSubmit={handleHireSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">Project Description</label>
                <textarea
                  rows={4}
                  required
                  value={hireMessage}
                  onChange={(e) => setHireMessage(e.target.value)}
                  placeholder="Describe your design project requirements, brand guidelines..."
                  className="w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    required
                    value={hireBudget}
                    onChange={(e) => setHireBudget(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">Timeline / Deadline</label>
                  <input
                    type="text"
                    required
                    value={hireTimeline}
                    onChange={(e) => setHireTimeline(e.target.value)}
                    placeholder="e.g. 3 weeks"
                    className="w-full rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-neutral-255 dark:border-neutral-900">
                <button 
                  type="submit" 
                  disabled={submittingHire} 
                  className={cn(buttonVariants({ variant: 'default', className: 'flex-1 text-xs font-semibold py-2 cursor-pointer' }))}
                >
                  {submittingHire ? "Sending..." : "Submit Proposal"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowHireModal(false)} 
                  className={cn(buttonVariants({ variant: 'outline', className: 'text-xs font-semibold py-2 cursor-pointer' }))}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
