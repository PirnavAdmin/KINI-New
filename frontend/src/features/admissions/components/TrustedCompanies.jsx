import { motion } from "framer-motion";

export default function TrustedCompanies() {
  const logos = ["Google", "Microsoft", "Amazon", "Deloitte", "IBM", "TCS", "Infosys"];

  return (
   <section className="w-full border-y border-slate-800/60 bg-slate-950/20 pt-2 mt-10 pb-4 px-4 overflow-hidden relative -mt-10">
      <div className="max-w-[1400px] mx-auto px-4 text-center mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Trusted By Learners Worldwide At Enterprise Leaders
        </h3>
      </div>
      
      {/* Infinite Horizontal Auto-Marquee Wrapper */}
      <div className="flex select-none overflow-hidden relative w-full mask-gradient">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          className="flex space-x-16 items-center whitespace-nowrap min-w-full"
        >
          {[...logos, ...logos].map((logo, index) => (
            <span
              key={index}
              className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-600/80 hover:text-slate-400 transition-colors cursor-default"
            >
              {logo}
            </span>
          ))}
        </motion.div>
      </div>

      <style>{`
        .mask-gradient {
          mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
        }
      `}</style>
    </section>
  );
}