import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GlowCard } from './ui/spotlight-card';

interface StatItemProps {
  target: number;
  suffix: string;
  label: string;
}

function StatItem({ target, suffix, label }: StatItemProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 1500; // ms
    const increment = target / (duration / 16); // ~60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <div ref={ref} className="w-full flex">
      <GlowCard 
        customSize={true} 
        glowColor="purple" 
        className="w-full text-center p-8 bg-neutral-50/50 dark:bg-neutral-950/40 backdrop-blur-xl border border-neutral-200 dark:border-neutral-900 rounded-none transition-all duration-300 relative z-10 group hover:border-brand-primary/50"
      >
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-2.5 relative z-20 group-hover:text-brand-primary dark:group-hover:text-brand-light transition-all duration-300"
        >
          {count}
          {suffix}
        </motion.div>
        <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-slate-400 relative z-20 group-hover:text-neutral-900 dark:group-hover:text-white transition-all duration-300">{label}</div>
      </GlowCard>
    </div>
  );
}

export default function Statistics() {
  const stats = [
    { target: 1000, suffix: "+", label: "Verified Designers" },
    { target: 500, suffix: "+", label: "Completed Projects" },
    { target: 50, suffix: "+", label: "Creative Categories" },
    { target: 200, suffix: "+", label: "Happy Clients" },
  ];

  return (
    <section className="bg-white dark:bg-black py-20 md:py-24 border-t border-neutral-200 dark:border-neutral-950 transition-colors duration-300">
      <div className="w-full px-4 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <StatItem
              key={stat.label}
              target={stat.target}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
