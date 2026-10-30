function SectionTitle({ title, subtitle }) {
  return (
    <div className="text-center mb-14">

      {/* Small Badge */}
      <div className="inline-block mb-4">

        <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-5 py-2 rounded-full tracking-wide uppercase shadow-sm">

          Explore Learning

        </span>

      </div>

      {/* Main Title */}
      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">

        {title}

      </h2>

      {/* Gradient Line */}
      <div className="w-28 h-1.5 bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] rounded-full mx-auto mt-5"></div>

      {/* Subtitle */}
      {subtitle && (
        <p className="max-w-2xl mx-auto text-gray-500 text-lg mt-6 leading-relaxed">

          {subtitle}

        </p>
      )}

    </div>
  );
}

export default SectionTitle;
