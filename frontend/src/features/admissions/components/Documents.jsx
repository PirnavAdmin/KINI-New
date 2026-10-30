import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  FiFileText,
  FiCreditCard,
  FiAward,
  FiCamera,
} from "react-icons/fi";
import { HiCheckCircle } from "react-icons/hi";

const docs = [
  {
    icon: FiFileText,
    title: "Updated Resume",
    desc: "Your most recent resume or CV highlighting education, skills, and any work experience.",
    note: "PDF or Word format, max 2 MB",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: FiCreditCard,
    title: "Government-Issued ID",
    desc: "Aadhar card, passport, PAN card, or any valid national identity document.",
    note: "Clear scan, both sides",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: FiAward,
    title: "Educational Certificates",
    desc: "Degree or diploma certificates from your highest completed level of education.",
    note: "Originals or attested copies",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: FiCamera,
    title: "Passport-Size Photo",
    desc: "A recent professional photograph with a plain white or light background.",
    note: "JPEG/PNG, min 300×300 px",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
];

function DocCard({ doc, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = doc.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex gap-4 items-start group hover:border-indigo-500/30 hover:bg-white/8 transition-all duration-300 overflow-hidden"
    >
      {/* Glow accent */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className={`shrink-0 w-12 h-12 rounded-xl ${doc.bg} border ${doc.border} flex items-center justify-center`}>
        <Icon className={`${doc.color} text-xl`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-white font-bold text-base">{doc.title}</h3>
          <HiCheckCircle className="text-green-400 text-base shrink-0" />
        </div>
        <p className="text-slate-400 text-sm leading-relaxed mb-2">{doc.desc}</p>
        <span className="inline-block text-xs text-slate-500 bg-white/5 border border-white/10 rounded-full px-3 py-0.5">
          {doc.note}
        </span>
      </div>
    </motion.div>
  );
}

export default function Documents() {
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true });

  return (
    <section className="relative py-12 md:py-16 lg:py-20 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-4">
            What You'll Need
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Required Documents
          </h2>
          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto">
            Keep these ready before you begin your application — upload takes
            less than two minutes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {docs.map((doc, i) => (
            <DocCard key={doc.title} doc={doc} index={i} />
          ))}
        </div>

        {/* Note card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm p-5 flex items-start gap-3"
        >
          <span className="text-amber-400 text-xl mt-0.5">ⓘ</span>
          <p className="text-slate-400 text-sm leading-relaxed">
            <span className="text-amber-300 font-semibold">Heads up:</span> All
            documents are reviewed with strict confidentiality. Working
            professionals can submit offer letters or payslips in place of
            experience certificates. Reach out to your counselor if you're
            unsure about any document.
          </p>
        </motion.div>
      </div>
    </section>
  );
}