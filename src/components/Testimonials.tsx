import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  type: 'client' | 'designer' | 'founder';
  avatar: string;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      quote: "Lanzy changed how we scale our design team. We hired two incredible branding experts in under a week. Zero commissions made it an easy decision.",
      author: "Sarah Jenkins",
      role: "VP of Product",
      company: "LinearFlow",
      type: "client",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120"
    },
    {
      quote: "As a freelance designer, I was tired of platforms taking 20% of my hard-earned money. Lanzy lets me build direct relationships with clients and keep 100% of my rate.",
      author: "David Kovacs",
      role: "Motion Graphics Artist",
      type: "designer",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120"
    },
    {
      quote: "We created Lanzy to remove the friction between creators and builders. It's built for design excellence, pure transparency, and direct trust.",
      author: "Amir Vance",
      role: "Co-Founder",
      company: "Lanzy",
      type: "founder",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  };

  const [[, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    let nextIdx = currentIndex + newDirection;
    if (nextIdx < 0) nextIdx = testimonials.length - 1;
    if (nextIdx >= testimonials.length) nextIdx = 0;
    setCurrentIndex(nextIdx);
    setPage([nextIdx, newDirection]);
  };

  const activeTestimonial = testimonials[currentIndex];

  return (
    <section className="bg-neutral-50 py-20 md:py-28 border-t border-neutral-200 overflow-hidden transition-colors duration-300">
      <div className="w-full px-4 md:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-3.5"
          >
            Endorsements
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight"
          >
            Loved By Designers And Clients
          </motion.h2>
        </div>

        {/* Testimonial Box */}
        <div className="relative bg-white border border-neutral-200 p-8 md:p-12 rounded-none shadow-card min-h-75 flex flex-col justify-between transition-colors duration-300">
          <div className="absolute top-8 right-8 text-neutral-200 pointer-events-none transition-colors duration-300">
            <Quote size={60} className="stroke-[1.5]" />
          </div>

          <div className="relative overflow-hidden flex-1">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col text-left"
              >
                {/* Rating Stars (for clients/designers) */}
                {activeTestimonial.type !== 'founder' && (
                  <div className="flex space-x-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-brand-primary text-brand-primary" />
                    ))}
                  </div>
                )}
                
                {/* Founder tag */}
                {activeTestimonial.type === 'founder' && (
                  <div className="mb-6 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-none inline-block self-start">
                    From Our Founder
                  </div>
                )}

                <blockquote className="text-lg md:text-xl font-medium text-neutral-850 leading-relaxed mb-8">
                  "{activeTestimonial.quote}"
                </blockquote>

                <div className="flex items-center space-x-4">
                  <img
                    src={activeTestimonial.avatar}
                    alt={activeTestimonial.author}
                    className="w-12 h-12 rounded-none object-cover border border-neutral-200"
                  />
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">{activeTestimonial.author}</h4>
                    <p className="text-xs text-neutral-500 font-medium">
                      {activeTestimonial.role} {activeTestimonial.company && `at ${activeTestimonial.company}`}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-neutral-200 pt-6 mt-8">
            {/* Dots */}
            <div className="flex space-x-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPage([idx, idx > currentIndex ? 1 : -1]);
                    setCurrentIndex(idx);
                  }}
                  className={`w-2.5 h-2.5 rounded-none transition-all duration-300 ${
                    idx === currentIndex ? 'bg-brand-primary w-6' : 'bg-neutral-200'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrow Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => paginate(-1)}
                className="p-2 border border-neutral-200 rounded-none text-neutral-500 hover:text-brand-primary hover:border-brand-primary transition-colors duration-200 cursor-pointer"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => paginate(1)}
                className="p-2 border border-neutral-200 rounded-none text-neutral-500 hover:text-brand-primary hover:border-brand-primary transition-colors duration-200 cursor-pointer"
                aria-label="Next Testimonial"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
