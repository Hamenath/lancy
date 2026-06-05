import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DesignerCard from "../components/DesignerCard";
import { DesignerCardSkeleton } from "../components/ui/Skeleton";
import { SlidersHorizontal, RefreshCw, Search } from "lucide-react";

interface DesignerProfile {
  id: string;
  name: string;
  email: string;
  photo: string;
  bio: string;
  skills: string[];
  rate: number;
  location: string;
  portfolioLinks: {
    github?: string;
    behance?: string;
    dribbble?: string;
  };
  specialty?: string;
  averageRating?: number;
  isAvailable?: boolean;
  viewsCount?: number;
  projectsCount?: number;
  createdAt?: string;
}

export default function Designers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [designers, setDesigners] = useState<DesignerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter states from URL or state
  const searchQuery = searchParams.get("search") || "";
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [minRate, setMinRate] = useState<number>(0);
  const [maxRate, setMaxRate] = useState<number>(300);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minRating, setMinRating] = useState<number>(0);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all"); // "all" | "available" | "busy"
  const [sortBy, setSortBy] = useState<string>("popularity"); // "popularity" | "rating" | "newest" | "projects"

  // Dynamic filter option lists
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [locationsList, setLocationsList] = useState<string[]>([]);

  useEffect(() => {
    async function fetchDesigners() {
      try {
        setLoading(true);
        // Fetch all reviews first to compute average ratings
        const reviewsSnapshot = await getDocs(collection(db, "reviews"));
        const ratingsMap: Record<string, { total: number; count: number }> = {};
        reviewsSnapshot.forEach((doc) => {
          const r = doc.data();
          if (r.designerId) {
            if (!ratingsMap[r.designerId]) {
              ratingsMap[r.designerId] = { total: 0, count: 0 };
            }
            ratingsMap[r.designerId].total += (r.rating || 0);
            ratingsMap[r.designerId].count += 1;
          }
        });

        // Fetch projects count per designer
        const projectsSnapshot = await getDocs(collection(db, "projects"));
        const projectsMap: Record<string, number> = {};
        projectsSnapshot.forEach((doc) => {
          const p = doc.data();
          if (p.designerId) {
            projectsMap[p.designerId] = (projectsMap[p.designerId] || 0) + 1;
          }
        });

        const querySnapshot = await getDocs(collection(db, "users"));
        const designersList: DesignerProfile[] = [];
        const skillsSet = new Set<string>();
        const locationsSet = new Set<string>();

        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<DesignerProfile, "id">;
          const ratingData = ratingsMap[doc.id];
          const avgRating = ratingData ? ratingData.total / ratingData.count : 5.0; // Default premium score is 5
          const projectsCount = projectsMap[doc.id] || 0;

          designersList.push({
            id: doc.id,
            ...data,
            averageRating: avgRating,
            projectsCount
          });

          // Collect skills
          if (data.skills && Array.isArray(data.skills)) {
            data.skills.forEach((skill) => skillsSet.add(skill.trim()));
          }
          // Collect locations
          if (data.location) {
            locationsSet.add(data.location.trim());
          }
        });

        setDesigners(designersList);
        setSkillsList(Array.from(skillsSet).sort());
        setLocationsList(Array.from(locationsSet).sort());
      } catch (error) {
        console.error("Error fetching designers:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDesigners();
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
    setAvailabilityFilter("all");
    setSortBy("popularity");
  };

  // 1. Apply Filter Rules
  const filteredDesigners = designers.filter((designer) => {
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = 
      designer.name?.toLowerCase().includes(searchLower) ||
      designer.bio?.toLowerCase().includes(searchLower) ||
      designer.specialty?.toLowerCase().includes(searchLower) ||
      designer.skills?.some((s) => s.toLowerCase().includes(searchLower));

    const matchesSkill = selectedSkill === "" || designer.skills?.includes(selectedSkill);
    const matchesLocation = selectedLocation === "" || designer.location === selectedLocation;
    const matchesRate = (designer.rate || 0) >= minRate && (designer.rate || 0) <= maxRate;
    const matchesCategory = selectedCategory === "" || designer.specialty === selectedCategory;
    const matchesRating = (designer.averageRating || 0) >= minRating;
    
    // Availability - default to available (true) if not set
    const isAvailable = designer.isAvailable !== false;
    const matchesAvailability = 
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && isAvailable) ||
      (availabilityFilter === "busy" && !isAvailable);

    return matchesSearch && matchesSkill && matchesLocation && matchesRate && matchesCategory && matchesRating && matchesAvailability;
  });

  // 2. Apply Sort Rules
  const sortedDesigners = [...filteredDesigners].sort((a, b) => {
    if (sortBy === "popularity") {
      return (b.viewsCount || 0) - (a.viewsCount || 0);
    }
    if (sortBy === "rating") {
      return (b.averageRating || 0) - (a.averageRating || 0);
    }
    if (sortBy === "newest") {
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    }
    if (sortBy === "projects") {
      return (b.projectsCount || 0) - (a.projectsCount || 0);
    }
    return 0;
  });

  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white antialiased flex flex-col justify-between transition-colors duration-300">
      <div>
        <Navbar />

        {/* Hero Banner Area */}
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-6">
          <div className="text-center md:text-left md:flex md:items-end md:justify-between mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-900">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-3">
                Discover Top Talent
              </h1>
              <p className="text-neutral-500 dark:text-slate-400 text-sm sm:text-base max-w-xl">
                Direct hiring with zero commission. Find creators specializing in brand design, Web development, illustration, and product aesthetics.
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

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["", "UI/UX", "Logo Design", "Branding", "Web Design", "Illustration"].map((cat) => (
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

          {/* Main Layout: Filters sidebar + grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
            
            {/* Left Column: Filters Toolbar */}
            <div className="lg:col-span-3 rounded-none border border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/40 p-6 backdrop-blur-xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-900 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="size-3.5" />
                  Filters
                </span>
                <span className="text-[10px] text-neutral-400 font-semibold">{sortedDesigners.length} results</span>
              </div>

              {/* Text Search */}
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

              {/* Sorting Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Sort By</label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-850 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary"
                  >
                    <option value="popularity">Popularity (Views)</option>
                    <option value="rating">Top Rated</option>
                    <option value="projects">Portfolio Count</option>
                    <option value="newest">Newest Join</option>
                  </select>
                </div>
              </div>

              {/* Availability Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Availability</label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-850 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="all">All Options</option>
                  <option value="available">Available Immediately</option>
                  <option value="busy">In a Project</option>
                </select>
              </div>

              {/* Skill Dropdown */}
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

              {/* Location Dropdown */}
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

              {/* Minimum Rating */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Min Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-850 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="0">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              {/* Price Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Hourly Rate Range</label>
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

            {/* Right Column: Cards Grid */}
            <div className="lg:col-span-9">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <DesignerCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <>
                  {sortedDesigners.length === 0 ? (
                    <div className="py-24 text-center border border-dashed border-neutral-200 dark:border-neutral-900 bg-neutral-50/20 dark:bg-neutral-950/20 text-neutral-500 dark:text-slate-500 text-sm">
                      No designers found matching your criteria. Try resetting filters.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                      {sortedDesigners.map((designer) => (
                        <DesignerCard key={designer.id} designer={designer} />
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
