import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ShinyButton } from '@/components/ui/shiny-button';

export default function CTASection() {
  return (
    <section id="cta" className="bg-white dark:bg-black py-20 md:py-28 border-t border-neutral-200 dark:border-neutral-950 relative overflow-hidden transition-colors duration-300">
      <div className="w-full px-4 md:px-8 text-center relative z-10">
        
        {/* Decorative Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-1 bg-neutral-100 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 px-3.5 py-1.5 rounded-none text-xs font-semibold text-neutral-800 dark:text-white mb-6"
        >
          <span>Get Started Today</span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-[1.15] max-w-3xl mx-auto mb-6"
        >
          Ready To Find Or Showcase Amazing Design Talent?
        </motion.h2>

        {/* Sub-text */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-base sm:text-lg text-neutral-500 dark:text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Join thousands of creative professionals and businesses collaborating directly. No fees, no limitations, just great design.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center space-y-3.5 sm:space-y-0 sm:space-x-4 max-w-md mx-auto"
        >
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/designers"
            className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-8 py-4 rounded-none shadow-sm transition-all duration-200 flex items-center justify-center space-x-2 dark:bg-white dark:hover:bg-neutral-200 dark:text-black"
          >
            <span>Explore Designers</span>
            <ArrowRight size={18} />
          </motion.a>

          <div className="flex items-center justify-center">
            <ShinyButton href="/register" className="w-full! sm:w-auto! py-4! px-8! text-base! font-semibold!">
              Join As Designer
            </ShinyButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
