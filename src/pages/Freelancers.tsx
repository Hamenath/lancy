import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FreelancerCard from "../components/FreelancerCard";
import { DesignerCardSkeleton } from "../components/ui/Skeleton";
import { SlidersHorizontal, RefreshCw, Search } from "lucide-react";
import { freelancerService } from "../services/freelancerService";
import type { Freelancer } from "../types";

export default function Freelancers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const searchQuery = searchParams.get("search") || "";
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [minRate, setMinRate] = useState<number>(0);
  const [maxRate, setMaxRate] = useState<number>(300);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("rating");

  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [locationsList, setLocationsList] = useState<string[]>([]);

  useEffect(() => {
    async function loadFreelancers() {
      try {
        setLoading(true);
        const list = await freelancerService.getAllFreelancers();
        setFreelancers(list);

        const skillsSet = new Set<string>();
        const locationsSet = new Set<string>();
        list.forEach((f) => {
          f.skills?.forEach((s) => skillsSet.add(s.trim()));
          if (f.location) locationsSet.add(f.location.trim());
        });
        setSkillsList(Array.from(skillsSet).sort());
        setLocationsList(Array.from(locationsSet).sort());
      } catch (error) {
        console.error("Error loading freelancers:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFreelancers();
  }, []);

  const handleSearchChange = (val: string) => {
    if (val) {
      setSearchParams({ search: val });
    } else {
      setSearchParams({});
    }
  };

  const resetFilters = () => {
    setSearchParams({});
    setSelectedSkill("");
    setSelectedLocation("");
    setMinRate(0);
    setMaxRate(300);
    setSelectedCategory("");
    setMinRating(0);
    setSortBy("rating");
  };

  const filteredFreelancers = freelancers.filter((f) => {
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = 
      f.name?.toLowerCase().includes(searchLower) ||
      f.bio?.toLowerCase().includes(searchLower) ||
      f.role?.toLowerCase().includes(searchLower) ||
      f.skills?.some((s) => s.toLowerCase().includes(searchLower));

    const matchesSkill = selectedSkill === "" || f.skills?.includes(selectedSkill);
    const matchesLocation = selectedLocation === "" || f.location === selectedLocation;
    const matchesRate = (f.rate || 0) >= minRate && (f.rate || 0) <= maxRate;
    const matchesCategory = selectedCategory === "" || f.role.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesRating = (f.rating || 0) >= minRating;
    
    return matchesSearch && matchesSkill && matchesLocation && matchesRate && matchesCategory && matchesRating;
  });

  const sortedFreelancers = [...filteredFreelancers].sort((a, b) => {
    if (sortBy === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === "rateAsc") {
      return (a.rate || 0) - (b.rate || 0);
    }
    if (sortBy === "rateDesc") {
      return (b.rate || 0) - (a.rate || 0);
    }
    return 0;
  });

  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white antialiased flex flex-col justify-between transition-colors duration-300">
      <div>
        <Navbar />

        <div className="w-full px-4 md:px-8 pt-32 pb-6">
          <div className="text-center md:text-left md:flex md:items-end md:justify-between mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-900">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-3">
                Discover Top Talent
              </h1>
              <p className="text-neutral-500 dark:text-slate-400 text-sm sm:text-base max-w-xl">
                Direct hiring with zero commission. Find top talent specializing in design, development, writing, and digital strategy.
              </p>
            </div>
            <button 
              onClick={resetFilters}
              className="mt-4 md:mt-0 flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-white transition-colors duration-250 cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              Reset Filters
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {["", "UI/UX", "Development", "Branding", "Web Design", "Writing"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-none border cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-brand-primary border-brand-primary text-white dark:bg-white dark:text-black dark:border-white"
                    : "bg-neutral-50 dark:bg-neutral-950 text-neutral-500 border-neutral-250 dark:border-neutral-900 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-800"
                }`}
              >
                {cat === "" ? "All Specialties" : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
            <div className="lg:col-span-3 rounded-none border border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/40 p-6 backdrop-blur-xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-900 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="size-3.5" />
                  Filters
                </span>
                <span className="text-[10px] text-neutral-400 font-semibold">{sortedFreelancers.length} results</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Keywords</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search skills, names..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-850 focus:border-brand-primary dark:focus:border-brand-primary focus:outline-none text-xs text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-850 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="rating">Top Rated</option>
                  <option value="rateAsc">Lowest Hourly Rate</option>
                  <option value="rateDesc">Highest Hourly Rate</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Expertise Skill</label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-850 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="">All Skills</option>
                  {skillsList.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-850 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="">All Locations</option>
                  {locationsList.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Hourly Rate</label>
                  <span className="text-xs font-extrabold text-brand-primary dark:text-white">${minRate} - ${maxRate}/hr</span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="150"
                    step="5"
                    value={minRate}
                    onChange={(e) => setMinRate(Number(e.target.value))}
                    className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-none appearance-none cursor-pointer accent-brand-primary dark:accent-white"
                  />
                  <input
                    type="range"
                    min="150"
                    max="300"
                    step="10"
                    value={maxRate}
                    onChange={(e) => setMaxRate(Number(e.target.value))}
                    className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-none appearance-none cursor-pointer accent-brand-primary dark:accent-white"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-9">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <DesignerCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <>
                  {sortedFreelancers.length === 0 ? (
                    <div className="py-24 text-center border border-dashed border-neutral-200 dark:border-neutral-900 bg-neutral-50/20 dark:bg-neutral-950/20 text-neutral-500 dark:text-slate-500 text-sm">
                      No freelancers found matching your criteria. Try resetting filters.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                      {sortedFreelancers.map((freelancer) => (
                        <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
