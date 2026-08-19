import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";

export const HeroParallax = ({
  products,
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );
  return (
    <div
      ref={ref}
      className="h-[220vh] sm:h-[250vh] md:h-[300vh] py-20 md:py-40 overflow-hidden antialiased relative flex flex-col self-auto perspective-[1000px] transform-3d bg-neutral-950 text-white transition-colors duration-300"
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className=""
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-10 md:space-x-20 mb-10 md:mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-10 md:mb-20 space-x-10 md:space-x-20">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-10 md:space-x-20">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = () => {
  return (
    <div className="w-full relative z-20 flex flex-col items-center justify-center py-12 md:py-20 px-4 md:px-8 left-0 top-0 text-center">
      {/* Launching Soon Badge */}
      <div className="inline-flex items-center space-x-2 bg-neutral-900 border border-neutral-800 px-3.5 py-1.5 rounded-none text-xs font-semibold text-slate-200 mb-6 w-fit">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
        </span>
        <span>🚀 Launching Soon</span>
      </div>

      <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
        Find Creative Designers <br />
        <span className="bg-linear-to-r from-brand-primary to-brand-light bg-clip-text text-transparent">
          For Your Next Big Idea
        </span>
      </h1>
      <p className="max-w-2xl text-lg text-neutral-400 leading-relaxed mb-8">
        Lanzy helps businesses connect directly with talented designers. No commissions. No middlemen. Just creativity and collaboration.
      </p>
      
      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center space-y-3.5 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
        <a
          href="/designers"
          className="bg-brand-primary hover:bg-brand-primary-hover text-white text-center font-semibold px-7 py-3.5 rounded-none shadow-sm transition-all duration-200"
        >
          Explore Designers
        </a>
        <a
          href="/register"
          className="bg-neutral-900 hover:bg-neutral-800 text-white text-center font-semibold px-7 py-3.5 rounded-none border border-neutral-800 transition-all duration-200"
        >
          Join as Designer
        </a>
      </div>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-48 w-[18rem] sm:h-64 sm:w-[24rem] md:h-96 md:w-120 relative shrink-0 rounded-none overflow-hidden border border-neutral-800"
    >
      <a
        href={product.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block group-hover/product:shadow-2xl"
      >
        <img
          src={product.thumbnail}
          className="object-cover object-top-left absolute h-full w-full inset-0 transition-transform duration-300"
          alt={product.title}
          loading="lazy"
        />
      </a>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-40 bg-black pointer-events-none transition-opacity duration-200"></div>
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white font-bold bg-neutral-950/90 px-3 py-1.5 rounded-none text-sm transition-opacity duration-200 border border-neutral-800">
        {product.title}
      </h2>
    </motion.div>
  );
};
