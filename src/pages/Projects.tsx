import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Search, SlidersHorizontal, ArrowRight, RefreshCw, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { projectService } from "../services/projectService";
import { DesignerCardSkeleton } from "../components/ui/Skeleton";

export default function Projects() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [maxBudget, setMaxBudget] = useState(Number(searchParams.get("maxBudget")) || 50000);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");

  useEffect(() => {
    fetchProjects();
  }, [searchParams]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const q = searchParams.get("search") || "";
      const data = await projectService.getAllProjects(q);
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateUrlParams = (newParams: Record<string, string>) => {
    const current: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      current[key] = val;
    });
    const updated = { ...current, ...newParams };
    
    // Remove empty params
    Object.keys(updated).forEach((key) => {
      if (!updated[key]) delete updated[key];
    });

    setSearchParams(updated);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchTerm });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setMaxBudget(50000);
    setSortBy("newest");
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="relative min-h-screen bg-white text-neutral-900 antialiased flex flex-col justify-between">
      <div className="flex-1 flex flex-col">
        <Navbar />

        {/* Hero Banner */}
        <section className="relative pt-28 pb-10 border-b border-neutral-200 bg-neutral-50">
          <div className="w-full px-4 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary mb-4 rounded-none">
                <span>Explore Opportunities</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-neutral-900">
                Discover <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-light">Freelance Projects</span>
              </h1>
              <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
                Browse open job listings, submit competitive proposals, and build your freelance reputation.
              </p>
            </div>

            {(user as any)?.role === "CLIENT" && (
              <Link
                to="/create-project"
                className="px-5 py-3 bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover transition-colors flex items-center gap-2 rounded-none shadow-sm"
              >
                <Plus className="size-4" /> Post a Project
              </Link>
            )}
          </div>
        </section>

        {/* Main Content Area */}
        <div className="w-full px-4 md:px-8 py-8 flex-1">
          {/* Top Search Controls */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 size-4 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects by title, skill, or keyword..."
                className="w-full h-10 pl-10 pr-4 text-xs bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-brand-primary rounded-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-neutral-600 font-medium whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateUrlParams({ sort: e.target.value });
                }}
                className="h-10 px-3 text-xs bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-brand-primary rounded-none"
              >
                <option value="newest">Newest First</option>
                <option value="budget_desc">Budget: High to Low</option>
                <option value="budget_asc">Budget: Low to High</option>
              </select>

              <button
                type="button"
                onClick={handleResetFilters}
                className="h-10 px-3 border border-neutral-300 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer rounded-none"
              >
                <RefreshCw className="size-3.5" />
                Reset
              </button>
            </div>
          </form>

          {/* Grid Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-64 shrink-0 border border-neutral-200 bg-neutral-50 p-5 rounded-none space-y-6 h-fit">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <h3 className="text-sm font-bold tracking-wider uppercase text-neutral-700 flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-brand-primary" /> Filters
                </h3>
              </div>

              {/* Max Budget Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700">Max Budget: ${maxBudget.toLocaleString()}</label>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={maxBudget}
                  onChange={(e) => {
                    setMaxBudget(Number(e.target.value));
                    updateUrlParams({ maxBudget: e.target.value });
                  }}
                  className="w-full accent-brand-primary cursor-pointer"
                />
              </div>
            </aside>

            {/* Results Grid */}
            <main className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <DesignerCardSkeleton key={i} />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="border border-neutral-200 bg-neutral-50 p-12 text-center rounded-none space-y-3">
                  <p className="text-base font-bold text-neutral-800">No active projects found matching your criteria.</p>
                  <p className="text-xs text-neutral-500">Try adjusting keyword search or budget filters.</p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-2 bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-hover transition-colors cursor-pointer rounded-none"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="border border-neutral-200 bg-white p-6 flex flex-col justify-between hover:border-brand-primary/40 transition-colors rounded-none space-y-4 shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-base font-bold text-neutral-900 hover:text-brand-primary transition-colors">
                            <Link to={`/projects/${project.id}`}>{project.title}</Link>
                          </h3>
                          <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/30 text-[10px] font-bold px-2 py-0.5 rounded-none whitespace-nowrap">
                            ${(project.budget || 0).toLocaleString()} {project.currency || "USD"}
                          </span>
                        </div>
                        <p className="text-neutral-600 text-xs line-clamp-3 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {project.skills && project.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {project.skills.slice(0, 4).map((s: string) => (
                            <span key={s} className="bg-neutral-100 border border-neutral-200 text-neutral-700 text-[10px] px-2 py-0.5 rounded-none">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-3 border-t border-neutral-200 flex justify-between items-center text-[10px] text-neutral-500">
                        <span>Posted by {project.clientName || "Client"}</span>
                        <Link
                          to={`/projects/${project.id}`}
                          className="text-brand-primary hover:underline font-bold flex items-center gap-1 transition-colors"
                        >
                          View Details <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
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
