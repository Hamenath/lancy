import { motion } from 'framer-motion';
import { 
  Layout, 
  Palette, 
  Layers, 
  Target, 
  Tv, 
  Video, 
  Monitor, 
  PenTool, 
  ArrowRight 
} from 'lucide-react';
import { GlowCard } from './ui/spotlight-card';

interface CategoryCardProps {
  icon: React.ReactNode;
  name: string;
  count: string;
  index: number;
}

function CategoryCard({ icon, name, count, index }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="w-full flex group"
    >
      <GlowCard 
        customSize={true} 
        glowColor="purple" 
        className="w-full p-6 bg-white border border-neutral-200 hover:border-brand-primary/50 rounded-none transition-all duration-300 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center space-x-4 relative z-20">
          <div className="bg-brand-primary/10 text-brand-primary p-3 rounded-none border border-brand-primary/20">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-neutral-900 transition-colors duration-200">{name}</h3>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">{count} designers</p>
          </div>
        </div>
        
        <div className="text-neutral-400 group-hover:text-brand-primary group-hover:translate-x-1 transition-all duration-200 relative z-20">
          <ArrowRight size={16} />
        </div>
      </GlowCard>
    </motion.div>
  );
}

export default function Categories() {
  const categories = [
    {
      icon: <Layout size={20} />,
      name: "UI/UX Design",
      count: "340+",
    },
    {
      icon: <Palette size={20} />,
      name: "Graphic Design",
      count: "280+",
    },
    {
      icon: <Layers size={20} />,
      name: "Logo Design",
      count: "190+",
    },
    {
      icon: <Target size={20} />,
      name: "Branding",
      count: "220+",
    },
    {
      icon: <Tv size={20} />,
      name: "Motion Graphics",
      count: "150+",
    },
    {
      icon: <Video size={20} />,
      name: "Video Editing",
      count: "110+",
    },
    {
      icon: <Monitor size={20} />,
      name: "Web Design",
      count: "260+",
    },
    {
      icon: <PenTool size={20} />,
      name: "Illustration",
      count: "180+",
    },
  ];

  return (
    <section id="categories" className="bg-neutral-50 py-20 md:py-24 border-t border-neutral-200 transition-colors duration-300">
      <div className="w-full px-4 md:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-3"
          >
            Specialized Talents
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight"
          >
            Find Designers In Every Creative Category
          </motion.h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, idx) => (
            <CategoryCard
              key={cat.name}
              index={idx}
              icon={cat.icon}
              name={cat.name}
              count={cat.count}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
