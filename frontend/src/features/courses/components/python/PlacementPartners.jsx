import { useEffect } from "react";
import AOS from "aos";
import Marquee from "react-fast-marquee";
import {
  Briefcase,
  Building2,
  TrendingUp,
  Award,
} from "lucide-react";

import "aos/dist/aos.css";

const companies = [
  {
    name: "Adobe",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_logo.svg",
  },
  {
    name: "Goldman Sachs",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg",
  },
  {
    name: "Myntra",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.png",
  },
  {
    name: "Twitter",
    logo: "https://upload.wikimedia.org/wikipedia/en/6/60/Twitter_Logo_as_of_2021.svg",
  },
  {
    name: "Accenture",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg",
  },
  {
    name: "Infosys",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
  },
  {
    name: "TCS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
  },
];

export default function PlacementPartners() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const stats = [
    {
      value: "2200+",
      label: "Students Placed",
      icon: Briefcase,
    },
    {
      value: "350+",
      label: "Hiring Partners",
      icon: Building2,
    },
    {
      value: "18 LPA",
      label: "Highest Package",
      icon: TrendingUp,
    },
    {
      value: "95%",
      label: "Placement Rate",
      icon: Award,
    },
  ];

  return (
    <section className="relative py-28 overflow-hidden bg-[#030712]">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 blur-[180px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 blur-[180px]" />

      <div
        data-aos="fade-up"
        className="relative z-10 max-w-7xl mx-auto px-6"
      >
        {/* Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-cyan-500/20 bg-white/5 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-medium">
              2200+ Students Successfully Placed
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mt-10">
          <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Trusted By
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Leading Global Companies
            </span>
          </h2>

          <p className="mt-6 text-slate-400 max-w-3xl mx-auto text-lg">
            Our learners are building successful careers at some of the world's
            most respected organizations through industry-focused training and
            placement support.
          </p>
        </div>

        {/* Premium Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-20">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  border border-white/10
                  bg-white/5
                  backdrop-blur-xl
                  p-8
                  hover:border-cyan-400/30
                  transition-all
                  duration-500
                  hover:-translate-y-2
                "
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition" />

                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7 text-cyan-400" />
                  </div>

                  <h3 className="text-4xl font-bold text-white">
                    {item.value}
                  </h3>

                  <p className="text-slate-400 mt-2">
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Logo Section */}
        <div
          className="
            mt-20
            rounded-[40px]
            border border-white/10
            bg-white/[0.03]
            backdrop-blur-2xl
            p-10
            shadow-[0_30px_80px_rgba(0,0,0,0.45)]
          "
        >
          <Marquee speed={45} pauseOnHover gradient={false}>
            {companies.map((company, index) => (
              <div
                key={index}
                className="
                  mx-8
                  flex
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white
                  px-10
                  py-6
                  hover:scale-105
                  transition-all
                  duration-300
                  shadow-xl
                "
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="
                    h-12
                    object-contain
                    grayscale
                    hover:grayscale-0
                    transition-all
                    duration-500
                  "
                />
              </div>
            ))}
          </Marquee>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button
            className="
              relative
              overflow-hidden
              px-10
              py-5
              rounded-2xl
              font-semibold
              text-white
              bg-gradient-to-r
              from-cyan-500
              via-blue-500
              to-purple-600
              shadow-[0_20px_60px_rgba(59,130,246,0.45)]
              hover:scale-105
              transition-all
              duration-300
            "
          >
            Explore Career Programs →
          </button>

          <p className="mt-4 text-slate-500 text-sm">
            Industry-ready training • Placement assistance • Live projects
          </p>
        </div>
      </div>
    </section>
  );
}