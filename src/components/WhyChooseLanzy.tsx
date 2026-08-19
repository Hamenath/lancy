import { motion } from 'framer-motion';
import { Percent, Link2, ShieldCheck, Sparkles, UserCheck, Smartphone } from 'lucide-react';
import { GlowCard } from './ui/spotlight-card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="w-full flex"
    >
      <GlowCard customSize={true} glowColor="blue" className="w-full p-8 flex flex-col items-start text-left bg-white/2 backdrop-blur-xl relative z-10 group border border-white/8 hover:border-white/45 transition-all duration-300">
        <div className="w-11 h-11 bg-neutral-900 text-white border border-neutral-800 flex items-center justify-center mb-6 z-20">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2.5 relative z-20 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text transition-all duration-300">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed relative z-20 group-hover:text-slate-300 transition-all duration-300">{description}</p>
      </GlowCard>
    </motion.div>
  );
}

export default function WhyChooseLanzy() {
  const features = [
    {
      icon: <Percent size={22} className="stroke-[2.5]" />,
      title: "100% Free To Use",
      description: "No monthly platform subscriptions, listing commissions, or payment fees. What you agree is what you pay/receive.",
    },
    {
      icon: <Link2 size={22} className="stroke-[2.5]" />,
      title: "Direct Connection",
      description: "Chat, agree on terms, share contacts, and handle projects directly without intermediaries, escrow rules, or filters.",
    },
    {
      icon: <ShieldCheck size={22} className="stroke-[2.5]" />,
      title: "Verified Designers",
      description: "Every designer is screened for real portfolios, skillsets, and professional conduct, giving you peace of mind.",
    },
    {
      icon: <Sparkles size={22} className="stroke-[2.5]" />,
      title: "Showcase Your Work",
      description: "An elegant, interactive designer portfolio engine tailored to show high-fidelity creative files and mockups.",
    },
    {
      icon: <UserCheck size={22} className="stroke-[2.5]" />,
      title: "Find The Perfect Match",
      description: "Advanced tag filtering and category matching to target specialized design needs in just a few clicks.",
    },
    {
      icon: <Smartphone size={22} className="stroke-[2.5]" />,
      title: "Built For Everyone",
      description: "From individual founders seeking quick visuals to agency directors looking for top-tier creative talent.",
    },
  ];

  return (
    <section id="designers" className="bg-black py-20 md:py-28 border-t border-neutral-900">
      <div className="w-full px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3.5"
          >
            The Lanzy Advantage
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight"
          >
            Built For Creativity. <br className="hidden sm:inline" /> Designed For Simplicity.
          </motion.h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <FeatureCard
              key={feature.title}
              index={idx}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
