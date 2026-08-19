import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FreelancerCard from "../components/FreelancerCard";
import { DesignerCardSkeleton } from "../components/ui/Skeleton";
import { SlidersHorizontal, RefreshCw, Search, Sparkles, CheckCircle2, ThumbsDown } from "lucide-react";
import { searchService } from "../services/searchService";
import { recommendationService, type ExplainableMatch } from "../services/recommendationService";
import type { Freelancer } from "../types";

export default function Freelancers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularSkills, setPopularSkills] = useState<{ skill: string; count: number }[]>([]);
  const [recommendations, setRecommendations] = useState<ExplainableMatch[]>([]);
  
  const queryQ = searchParams.get("q") || "";
  const querySkills = searchParams.get("skills") ? searchParams.get("skills")!.split(",") : [];
  const queryMinRate = searchParams.get("minRate") ? Number(searchParams.get("minRate")) : 0;
  const queryMaxRate = searchParams.get("maxRate") ? Number(searchParams.get("maxRate")) : 300;
  const queryMinRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : 0;
  const querySort = searchParams.get("sort") || "relevance";

  const [searchTerm, setSearchTerm] = useState(queryQ);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(querySkills);
  const [minRate, setMinRate] = useState(queryMinRate);
  const [maxRate, setMaxRate] = useState(queryMaxRate);
  const [minRating, setMinRating] = useState(queryMinRating);
  const [sortBy, setSortBy] = useState(querySort);

  useEffect(() => {
    searchService.getPopularSkills().then((res) => setPopularSkills(res));
    // Fetch recommendations for demo project
    recommendationService.getFreelancerRecommendations("demo-project-1", 3)
      .then((res) => setRecommendations(res))
      .catch(() => {});
  }, []);

  const updateUrlParams = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val !== undefined && val !== "" && val !== "0") {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  useEffect(() => {
    async function loadFreelancers() {
      try {
        setLoading(true);
        const result = await searchService.searchFreelancers({
          q: queryQ,
          skills: querySkills,
          minRate: queryMinRate > 0 ? queryMinRate : undefined,
          maxRate: queryMaxRate < 300 ? queryMaxRate : undefined,
          minRating: queryMinRating > 0 ? queryMinRating : undefined,
          sort: querySort,
        });
        setFreelancers(result.items);
      } catch (err) {
        console.error("Error searching freelancers:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFreelancers();
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({
      q: searchTerm.trim(),
      skills: selectedSkills.join(","),
      minRate: minRate.toString(),
      maxRate: maxRate.toString(),
      minRating: minRating.toString(),
      sort: sortBy,
    });
  };

  const toggleSkill = (skillName: string) => {
    const next = selectedSkills.includes(skillName)
      ? selectedSkills.filter((s) => s !== skillName)
      : [...selectedSkills, skillName];
    setSelectedSkills(next);
    updateUrlParams({ skills: next.join(",") });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedSkills([]);
    setMinRate(0);
    setMaxRate(300);
    setMinRating(0);
    setSortBy("relevance");
    setSearchParams(new URLSearchParams());
  };

  const handleDismissRec = (id: string) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
    recommendationService.recordFeedback(id, "FREELANCER", "DISMISSED").catch(() => {});
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Discover Top Freelancers
          </h1>
          <p className="text-slate-400 text-lg">
            Find verified software engineers, UI/UX designers, copywriters, and digital specialists.
          </p>
        </div>

        {/* AI Intelligent Recommendations Banner */}
        {recommendations.length > 0 && (
          <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/40 border border-emerald-500/30 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                AI Marketplace Matches (Explainable Recommendations)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-slate-900/90 border border-emerald-500/20 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {rec.matchPercentage}% Match
                      </span>
                      <button 
                        onClick={() => handleDismissRec(rec.id)}
                        className="text-slate-500 hover:text-slate-300 transition"
                        title="Dismiss recommendation"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="font-bold text-white text-sm">{rec.item.user?.name || rec.item.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rec.explainabilityReason}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold text-emerald-400">${rec.item.hourlyRate}/hr</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-8">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by freelancer title, bio, or skill (e.g. React, NestJS, UI/UX)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-12 pr-28 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="absolute right-2.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" /> Filters
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    updateUrlParams({ sort: e.target.value });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="relevance">Relevance Ranking</option>
                  <option value="rating">Highest Rated</option>
                  <option value="rate_low">Rate: Low to High</option>
                  <option value="rate_high">Rate: High to Low</option>
                  <option value="newest">Newest Members</option>
                </select>
              </div>

              {/* Hourly Rate Filter */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">
                  Hourly Rate (${minRate} - ${maxRate}/hr)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minRate}
                    onChange={(e) => setMinRate(Number(e.target.value))}
                    placeholder="Min Rate"
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                  <input
                    type="number"
                    value={maxRate}
                    onChange={(e) => setMaxRate(Number(e.target.value))}
                    placeholder="Max Rate"
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Minimum Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => {
                    setMinRating(Number(e.target.value));
                    updateUrlParams({ minRating: e.target.value });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                >
                  <option value="0">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                </select>
              </div>

              {/* Popular Skills */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-3 uppercase">Popular Skills</label>
                <div className="flex flex-wrap gap-1.5">
                  {popularSkills.slice(0, 10).map(({ skill }) => {
                    const active = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`text-xs px-2.5 py-1 rounded-md border transition ${
                          active
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-medium"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DesignerCardSkeleton />
                <DesignerCardSkeleton />
                <DesignerCardSkeleton />
                <DesignerCardSkeleton />
              </div>
            ) : freelancers.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-2">No freelancers found</h3>
                <p className="text-slate-400 mb-6">Try adjusting your search criteria or resetting filters.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {freelancers.map((freelancer) => (
                  <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
