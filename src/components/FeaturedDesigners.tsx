import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { GlowCard } from './ui/spotlight-card';
import { db } from '../firebase/config';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

interface Designer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  reviews: number;
  skills: string[];
  portfolioUrl: string;
  portfolioTitle: string;
  isVerified?: boolean;
}

export default function FeaturedDesigners() {
  const [designersList, setDesignersList] = useState<Designer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const tempDesigners: Designer[] = [];

        for (const docSnap of usersSnap.docs) {
          const userData = docSnap.data();
          const userId = docSnap.id;

          // Fetch reviews count & rating
          const revQuery = query(collection(db, "reviews"), where("designerId", "==", userId));
          const revSnap = await getDocs(revQuery);
          let totalRating = 0;
          revSnap.forEach((rDoc) => {
            totalRating += rDoc.data().rating || 0;
          });
          const avgRating = revSnap.size > 0 ? totalRating / revSnap.size : 5.0;

          // Fetch first project for preview
          const projQuery = query(collection(db, "projects"), where("designerId", "==", userId), limit(1));
          const projSnap = await getDocs(projQuery);
          let portfolioUrl = "https://images.unsplash.com/photo-1541462608141-2ffb68df685e?auto=format&fit=crop&q=80&w=500";
          let portfolioTitle = "No portfolio showcase uploaded";
          if (!projSnap.empty) {
            const projData = projSnap.docs[0].data();
            portfolioUrl = projData.imageUrl || portfolioUrl;
            portfolioTitle = projData.title || portfolioTitle;
          }

          tempDesigners.push({
            id: userId,
            name: userData.name || "Creative Designer",
            role: userData.specialty || "Product & UI Designer",
            avatar: userData.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name || "U")}&radius=0&backgroundColor=000000&textColor=ffffff`,
            rating: avgRating,
            reviews: revSnap.size,
            skills: userData.skills || ["Figma", "Design Systems"],
            portfolioUrl,
            portfolioTitle,
            isVerified: userData.isVerified || false
          });
        }

        // Sort by rating desc, views desc, then take top 3
        tempDesigners.sort((a, b) => b.rating - a.rating);
        setDesignersList(tempDesigners.slice(0, 3));
      } catch (err) {
        console.error("Error fetching featured designers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <section id="clients" className="bg-white dark:bg-black py-20 md:py-28 border-t border-neutral-200 dark:border-neutral-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-2xl text-left">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-slate-400 mb-3.5"
            >
              Featured Talent
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight"
            >
              Connect With Premium Designers
            </motion.h2>
          </div>
          
          <Link
            className="group flex items-center space-x-1.5 text-sm font-semibold text-neutral-800 dark:text-white hover:text-brand-primary dark:hover:text-brand-light transition-colors duration-200 mt-4 md:mt-0"
            to="/designers"
          >
            <span>View all designers</span>
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </Link>
        </div>

        {/* List of Horizontal Cards */}
        <div className="flex flex-col space-y-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 dark:border-neutral-800 border-t-brand-primary"></div>
            </div>
          ) : designersList.length === 0 ? (
            <p className="text-neutral-550 dark:text-neutral-500 text-xs text-center py-12">No verified designers found yet.</p>
          ) : (
            designersList.map((designer, idx) => (
            <motion.div
              key={designer.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="w-full flex"
            >
              <GlowCard 
                customSize={true} 
                glowColor="purple" 
                className="w-full p-0 grid grid-cols-1 lg:grid-cols-12 rounded-none bg-neutral-50/50 dark:bg-neutral-950/40 backdrop-blur-xl border border-neutral-200 dark:border-neutral-900 hover:border-brand-primary/50 dark:hover:border-brand-primary/50 transition-all duration-300 overflow-hidden"
              >
                {/* Designer Details (Left column) */}
                <div className="p-8 lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-900 relative z-20">
                  <div>
                    <div className="flex items-center space-x-4 mb-5">
                      <div className="relative">
                        <img
                          src={designer.avatar}
                          alt={designer.name}
                          className="w-16 h-16 rounded-none object-cover border border-neutral-200 dark:border-neutral-800"
                        />
                        {designer.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-950 p-0.5 rounded-none border border-neutral-250 dark:border-neutral-900">
                            <CheckCircle2 size={16} className="text-brand-primary fill-transparent dark:text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center space-x-1">
                          <span>{designer.name}</span>
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-slate-400 font-medium">{designer.role}</p>
                      </div>
                    </div>

                    <div className="inline-flex items-center space-x-1.5 mb-6 bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 rounded-none border border-neutral-200 dark:border-neutral-800">
                      <Star size={14} className="fill-brand-primary text-brand-primary" />
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">{designer.rating.toFixed(2)}</span>
                      <span className="text-xs text-neutral-500 dark:text-slate-400">({designer.reviews} projects)</span>
                    </div>

                    {/* Skills tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {designer.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-semibold text-neutral-600 dark:text-slate-300 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1 rounded-none"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-900">
                    <span className="text-xs font-medium text-neutral-500 dark:text-slate-400">Available immediately</span>
                    <Link
                      to={`/designer/${designer.id}`}
                      className="text-xs font-bold text-brand-primary dark:text-white hover:underline transition-all duration-200"
                    >
                      View Full Profile
                    </Link>
                  </div>
                </div>

                {/* Portfolio Preview (Right column) */}
                <div className="lg:col-span-7 bg-neutral-200 dark:bg-neutral-900 overflow-hidden group/portfolio flex flex-col justify-end p-8 min-h-55 lg:min-h-0 relative z-20">
                  <img
                    src={designer.portfolioUrl}
                    alt={designer.portfolioTitle}
                    className="absolute inset-0 w-full h-full object-cover group-hover/portfolio:scale-[1.02] transition-transform duration-500"
                  />
                  {/* Visual overlay for bottom text */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  <div className="relative z-10 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-350 mb-1">Portfolio Spotlight</p>
                    <h4 className="text-lg font-bold text-white tracking-tight">{designer.portfolioTitle}</h4>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))
        )}
        </div>
      </div>
    </section>
  );
}
