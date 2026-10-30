import { motion } from "framer-motion";

function PlacementPartners() {
  const companies = [
    "TCS", "Infosys", "Wipro", "Accenture",
    "Cognizant", "Capgemini", "HCL", "Tech Mahindra",
    "Amazon", "Microsoft", "Google", "Adobe",
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-6 py-3 rounded-full bg-[#EDF4FC] text-[#085FA7] font-semibold border border-[#085FA7]/20">
            🚀 2200+ Students Placed At Top Companies
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-[#0F172A]">
            Trusted{" "}
            <span className="bg-gradient-to-r from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent">
              Hiring Partners
            </span>
          </h2>

          <p className="mt-4 text-lg text-[#64748B] max-w-2xl mx-auto">
            Our learners have successfully secured opportunities
            at leading global companies and startups.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="rounded-3xl p-6 text-center border backdrop-blur-xl bg-white/80 border-[#E5E7EB] shadow-sm">
            <h3 className="text-4xl font-bold text-[#085FA7]">20K+</h3>
            <p className="text-[#64748B] mt-2">Students Trained</p>
          </div>
          <div className="rounded-3xl p-6 text-center border backdrop-blur-xl bg-white/80 border-[#E5E7EB] shadow-sm">
            <h3 className="text-4xl font-bold text-[#5CA347]">2200+</h3>
            <p className="text-[#64748B] mt-2">Placements</p>
          </div>
          <div className="rounded-3xl p-6 text-center border backdrop-blur-xl bg-white/80 border-[#E5E7EB] shadow-sm">
            <h3 className="text-4xl font-bold text-[#085FA7]">350+</h3>
            <p className="text-[#64748B] mt-2">Hiring Partners</p>
          </div>
          <div className="rounded-3xl p-6 text-center border backdrop-blur-xl bg-white/80 border-[#E5E7EB] shadow-sm">
            <h3 className="text-4xl font-bold text-[#F0765B]">95%</h3>
            <p className="text-[#64748B] mt-2">Success Rate</p>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {companies.map((company, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8, scale: 1.03 }}
              className="bg-white/80 rounded-3xl p-6 border border-[#E5E7EB] shadow-sm text-center cursor-pointer transition-all duration-300 backdrop-blur-xl hover:border-[#085FA7]/20 hover:shadow-md"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-[#085FA7] to-[#5CA347] flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                {company.charAt(0)}
              </div>
              <h4 className="font-bold text-[#0F172A]">
                {company}
              </h4>
              <p className="text-sm text-[#94A3B8] mt-1">
                Hiring Partner
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PlacementPartners;
