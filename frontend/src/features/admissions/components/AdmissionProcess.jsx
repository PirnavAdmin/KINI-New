import { motion } from "framer-motion";
import { FiEdit3, FiSliders, FiSmile, FiUserCheck, FiZap } from "react-icons/fi";

export default function AdmissionProcess() {
  const steps = [
    { num: "1", icon: <FiEdit3 />, title: "Submit Application", desc: "Complete the online application securely specifying your profile targets." },
    { num: "2", icon: <FiSliders />, title: "Eligibility Review", desc: "Our admissions committee checks academic performance and background fit." },
    { num: "3", icon: <FiSmile />, title: "Career Counselling", desc: "Align career mapping with structural specializations tailored to market paths." },
    { num: "4", icon: <FiUserCheck />, title: "Enrollment Confirmation", desc: "Secure cohort allocation via formal credential verification." },
    { num: "5", icon: <FiZap />, title: "Start Learning", desc: "Gain immediate access to pre-cohort components and live workflows." },
  ];

  return (
   <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-4 md:pt-6 pb-16 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Our Admission Process</h2>
        <p className="text-slate-400">Streamlined, performance-driven phases designed to accelerate onboarding.</p>
      </div>

      {/* Horizontal Timelines Process Row for Desktop, Vertical Stack for Mobile */}
      <div className="relative grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Connecting Desktop Process Line */}
        <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-blue-500/20 via-purple-500/40 to-blue-500/20 z-0" />

        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center relative z-10 group">
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full border border-slate-700 bg-slate-900 group-hover:border-purple-500 transition-all duration-300 shadow-xl mb-4">
              <div className="text-2xl text-purple-400 group-hover:text-white group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>
              <span className="absolute -bottom-2 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-xs font-bold text-white shadow-md">
                {step.num}
              </span>
            </div>
            
            <h3 className="text-md font-bold text-slate-100 group-hover:text-purple-300 transition-colors mb-2 mt-2">
              {step.title}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed px-2">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}