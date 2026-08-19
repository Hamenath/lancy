import { Link } from "react-router-dom";
import { GlowCard } from "./ui/spotlight-card";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { freelancerService } from "../services/freelancerService";
import { Heart } from "lucide-react";
import type { Freelancer } from "../types";

export default function FreelancerCard({ freelancer }: { freelancer: Freelancer }) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function checkSavedStatus() {
      if (!user) return;
      const saved = await freelancerService.isFavorite(user.uid, freelancer.id);
      setIsSaved(saved);
    }
    checkSavedStatus();
  }, [user, freelancer.id]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Please log in to save freelancers.");
      return;
    }
    try {
      const newStatus = await freelancerService.toggleFavorite(user.uid, freelancer.id, isSaved);
      setIsSaved(newStatus);
    } catch (err) {
      console.error("Error toggling favorite status:", err);
    }
  };

  return (
    <GlowCard 
      customSize={true} 
      glowColor="blue" 
      className="w-full p-6 bg-neutral-950/40 border border-neutral-900 rounded-none transition-all duration-300 flex flex-col justify-between group"
    >
      <div className="relative z-20">
        {/* Avatar & Price */}
        <div className="flex justify-between items-start mb-4">
          <img
            src={freelancer.photo}
            alt={freelancer.name}
            className="h-16 w-16 rounded-none object-cover border border-neutral-900 bg-neutral-900"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSave}
              className={`p-1.5 border transition-all rounded-none cursor-pointer ${
                isSaved 
                  ? "bg-white text-black border-white" 
                  : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700"
              }`}
            >
              <Heart size={14} className={isSaved ? "fill-black text-black" : "text-neutral-400"} />
            </button>
            <span className="text-sm font-bold text-white bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-none">
              ${freelancer.rate}/hr
            </span>
          </div>
        </div>

        {/* Title & location */}
        <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text transition-all duration-300 flex items-center gap-1.5">
          <span>{freelancer.name}</span>
          {freelancer.isVerified && (
            <span className="text-[9px] text-green-400 font-bold bg-green-950/15 border border-green-900 px-1 py-0.2 select-none">
              ✓ Verified
            </span>
          )}
        </h3>
        <p className="text-xs text-neutral-500 mb-3">📍 {freelancer.location || "Remote"}</p>

        {/* Bio snippet */}
        <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
          {freelancer.bio || "No description provided."}
        </p>

        {/* Skills tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {freelancer.skills?.slice(0, 4).map((skill, i) => (
            <span
              key={i}
              className="text-[10px] uppercase font-semibold tracking-wider text-slate-300 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-none"
            >
              {skill}
            </span>
          ))}
          {freelancer.skills?.length > 4 && (
            <span className="text-[10px] text-neutral-500 px-1 py-0.5">
              +{freelancer.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* View Profile Action button */}
      <div className="relative z-20">
        <Link
          to={`/designer/${freelancer.id}`}
          className="block text-center w-full bg-white text-black hover:bg-neutral-200 py-2 rounded-none font-semibold text-xs transition-colors"
        >
          View Profile
        </Link>
      </div>
    </GlowCard>
  );
}
