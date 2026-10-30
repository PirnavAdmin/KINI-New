import { motion } from "framer-motion";
import {
  Code2,
  Cpu,
  Cloud,
  Container,
  Database,
  Shield,
} from "lucide-react";

const COURSES = [
  { icon: Code2, label: "Frontend Engineering", color: "#60A5FA", desc: "React · Next.js · TypeScript" },
  { icon: Cpu, label: "AI Engineering", color: "#A855F7", desc: "LLMs · RAG · Agents" },
  { icon: Cloud, label: "Cloud Computing", color: "#06B6D4", desc: "AWS · GCP · Azure" },
  { icon: Container, label: "DevOps", color: "#F59E0B", desc: "Docker · K8s · CI/CD" },
  { icon: Database, label: "Data Science", color: "#10B981", desc: "ML · Python · SQL" },
  { icon: Shield, label: "Cyber Security", color: "#EF4444", desc: "Network · App Security" },
];

const cardAnimations = [
  { y: [0, -15, 0], delay: 0 },
  { y: [0, 15, 0], delay: 1.5 },
  { y: [0, -10, 0], delay: 0.8 },
  { y: [0, 12, 0], delay: 2.2 },
  { y: [0, -8, 0], delay: 1.2 },
  { y: [0, 10, 0], delay: 0.5 },
];

export default function HeroScene() {
  return (
    <div className="relative z-10 flex flex-col justify-center items-center">
      {/* Floating course cards grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-[480px]">
        {COURSES.map((course, i) => (
          <motion.div
            key={course.label}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1, y: cardAnimations[i].y }}
            transition={{
              opacity: { duration: 0.6, delay: 0.55 + i * 0.08 },
              scale: { duration: 0.6, delay: 0.55 + i * 0.08 },
              y: {
                duration: 6,
                delay: cardAnimations[i].delay,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="group cursor-default"
            style={{ perspective: 1000 }}
          >
            <div
              className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,.04)",
                backdropFilter: "blur(30px)",
                border: "1px solid rgba(255,255,255,.08)",
                boxShadow: "0 30px 80px rgba(0,0,0,.45)",
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `${course.color}20`,
                  color: course.color,
                }}
              >
                <course.icon size={18} />
              </div>

              {/* Label */}
              <h3
                className="text-sm font-semibold mb-1"
                style={{ color: "rgba(255,255,255,.9)" }}
              >
                {course.label}
              </h3>

              {/* Description */}
              <p
                className="text-xs"
                style={{ color: "rgba(255,255,255,.45)" }}
              >
                {course.desc}
              </p>

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{
                  background: `radial-gradient(600px circle at center, ${course.color}10, transparent 60%)`,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="grid grid-cols-4 gap-3 w-full max-w-[480px] mt-8"
      >
        {[
          { value: "25K+", label: "Learners", color: "#60A5FA" },
          { value: "98%", label: "Placement", color: "#A855F7" },
          { value: "500+", label: "Hiring Partners", color: "#06B6D4" },
          { value: "4.9★", label: "Student Rating", color: "#F59E0B" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -5, scale: 1.03 }}
            className="text-center rounded-xl p-3 transition-all duration-200 cursor-default"
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <p
              className="text-lg font-bold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "rgba(255,255,255,.5)" }}
            >
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
