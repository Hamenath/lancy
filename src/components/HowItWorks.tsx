import { motion } from 'framer-motion';
import { Search, MessageSquare, Handshake, CheckCircle2 } from 'lucide-react';
import { GlowCard } from './ui/spotlight-card';

interface StepProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function StepCard({ number, icon, title, description, index }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="w-full flex"
    >
      <GlowCard 
        customSize={true} 
        glowColor="blue" 
        className="w-full p-8 flex flex-col items-center text-center bg-white/2 backdrop-blur-xl border border-white/8 hover:border-white/45 rounded-none transition-all duration-300 relative z-10 group"
      >
        {/* Circle Icon Container */}
        <div className="relative flex items-center justify-center w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-none z-20 text-white mb-6 mx-auto">
          {icon}
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-6 h-6 bg-white text-black text-[11px] font-bold rounded-none">
            {number}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2.5 relative z-20 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text transition-all duration-300">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-[240px] relative z-20 group-hover:text-slate-300 transition-all duration-300">{description}</p>
      </GlowCard>
    </motion.div>
  );
}

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <Search size={22} className="stroke-[2.5]" />,
      title: "Explore",
      description: "Browse curated designers by category, skillset, hourly rates, or portfolio style.",
    },
    {
      number: "02",
      icon: <MessageSquare size={22} className="stroke-[2.5]" />,
      title: "Connect",
      description: "Message candidates directly. Discuss your project brief, budget, and timelines.",
    },
    {
      number: "03",
      icon: <Handshake size={22} className="stroke-[2.5]" />,
      title: "Collaborate",
      description: "Hire the designer without escrow limits, platform lock-ins, or extra fees.",
    },
    {
      number: "04",
      icon: <CheckCircle2 size={22} className="stroke-[2.5]" />,
      title: "Create",
      description: "Launch your project together. Enjoy clean handoffs and stellar creative results.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-black py-20 md:py-28 border-t border-neutral-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3.5"
          >
            Simple Flow
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
          >
            Simple Steps To Your Next Great Project
          </motion.h2>
        </div>

        {/* Steps Grid / Timeline Wrapper */}
        <div className="relative">
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-[1.5px] bg-neutral-900 z-0">
            <div className="w-full h-full border-t border-dashed border-neutral-800"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-6">
            {steps.map((step, idx) => (
              <StepCard
                key={step.title}
                index={idx}
                number={step.number}
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
