import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FreelancerCard from "../components/FreelancerCard";
import { DesignerCardSkeleton } from "../components/ui/Skeleton";
import { SlidersHorizontal, RefreshCw, Search, X } from "lucide-react";
import { searchService } from "../services/searchService";
import type { Freelancer } from "../types";

export default function Freelancers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularSkills, setPopularSkills] = useState<{ skill: string; count: number }[]>([]);
  
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

  // Load Popular Skills once
  useEffect(() => {
    searchService.getPopularSkills().then((res) => setPopularSkills(res));
  }, []);

  // Sync state to URL search params
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

  // Perform search query whenever URL search params change
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

  return (
    <div className="relative min-h-screen bg-black text-white antialiased flex flex-col justify-between">
      <div className="flex-1 flex flex-col">
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-32 pb-12 border-b border-neutral-900 bg-neutral-950/40">
          <div className="w-full px-4 md:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary mb-4 rounded-none">
                <span>Top Talent Marketplace</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                Hire Exceptional <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-light">Freelancers</span>
              </h1>
              <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                Connect with verified developers, designers, writers, and digital specialists to build your next breakthrough product.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="w-full px-4 md:px-8 py-8 flex-1">
          {/* Top Control Bar: Search & Sort */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 size-4 text-neutral-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search freelancers by name, skill, or keyword..."
                className="w-full h-10 pl-10 pr-4 text-xs bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-brand-primary rounded-none transition-colors"
              />
            </div>

            {/* Sort & Action Controls */}
            <div className="flex items-center gap-3">
              <label className="text-xs text-neutral-400 font-medium whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateUrlParams({ sort: e.target.value });
                }}
                className="h-10 px-3 text-xs bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-brand-primary rounded-none"
              >
                <option value="relevance">Relevance Ranking</option>
                <option value="rating">Highest Rating</option>
                <option value="reviews">Most Reviews</option>
                <option value="rate_asc">Hourly Rate: Low to High</option>
                <option value="rate_desc">Hourly Rate: High to Low</option>
                <option value="newest">Newest Members</option>
              </select>

              <button
                type="button"
                onClick={handleResetFilters}
                className="h-10 px-3 border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer rounded-none"
              >
                <RefreshCw className="size-3.5" />
                Reset
              </button>
            </div>
          </form>

          {/* Popular Skill Tags */}
          {popularSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-neutral-900 pb-6">
              <span className="text-xs font-bold text-neutral-500 mr-2">Popular Skills:</span>
              {popularSkills.map((item) => {
                const isSelected = selectedSkills.includes(item.skill);
                return (
                  <button
                    key={item.skill}
                    type="button"
                    onClick={() => toggleSkill(item.skill)}
                    className={`text-xs px-2.5 py-1 border transition-colors cursor-pointer rounded-none ${
                      isSelected
                        ? "bg-brand-primary text-white border-brand-primary font-bold"
                        : "bg-neutral-950 text-neutral-400 border-neutral-850 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    {item.skill}
                    {isSelected && <X className="inline-block size-3 ml-1" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sidebar & Grid Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-64 shrink-0 border border-neutral-900 bg-neutral-950/20 p-5 rounded-none space-y-6 h-fit">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <h3 className="text-sm font-bold tracking-wider uppercase text-neutral-400 flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-brand-primary" /> Filters
                </h3>
              </div>

              {/* Min Rating */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300">Min Rating: {minRating} Stars</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={minRating}
                  onChange={(e) => {
                    setMinRating(Number(e.target.value));
                    updateUrlParams({ minRating: e.target.value });
                  }}
                  className="w-full accent-brand-primary cursor-pointer"
                />
              </div>

              {/* Hourly Rate */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300">Max Hourly Rate: ${maxRate}/hr</label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={maxRate}
                  onChange={(e) => {
                    setMaxRate(Number(e.target.value));
                    updateUrlParams({ maxRate: e.target.value });
                  }}
                  className="w-full accent-brand-primary cursor-pointer"
                />
              </div>
            </aside>

            {/* Results Grid */}
            <main className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <DesignerCardSkeleton key={i} />
                  ))}
                </div>
              ) : freelancers.length === 0 ? (
                <div className="border border-neutral-900 bg-neutral-950/20 p-12 text-center rounded-none space-y-3">
                  <p className="text-base font-bold text-neutral-300">No freelancers found matching your criteria.</p>
                  <p className="text-xs text-neutral-500">Try broadening your search terms or resetting filters.</p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-2 bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer rounded-none"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {freelancers.map((freelancer) => (
                    <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
