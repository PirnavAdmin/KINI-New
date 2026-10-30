import WordsPullUpMultiStyle from "./WordsPullUpMultiStyle";
import AnimatedLetter from "./AnimatedLetter";

const headingSegments = [
  { text: "I am Marcus Chen,", className: "font-normal" },
  { text: "a self-taught director.", className: "font-serif" },
  {
    text: "I have skills in color grading, visual effects, and narrative design.",
    className: "font-normal",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="bg-black py-20 sm:py-28 md:py-36 lg:py-44 px-4">
      <div className="mx-auto max-w-6xl bg-[#101010] rounded-2xl md:rounded-[2rem] px-6 py-14 sm:py-20 md:py-28 lg:py-32">
        {/* Top label */}
        <p
          className="text-center text-[10px] sm:text-xs tracking-widest mb-6 sm:mb-8 md:mb-10"
          style={{ color: "#DEDBC8" }}
        >
          Visual arts
        </p>

        {/* Multi-style heading */}
        <div
          className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-3xl mx-auto"
          style={{ color: "#DEDBC8" }}
        >
          <span className="inline-flex flex-wrap justify-center leading-[0.95] sm:leading-[0.9]">
            <WordsPullUpMultiStyle segments={headingSegments} />
          </span>
        </div>

        {/* Scroll-linked character opacity body */}
        <div className="mt-10 sm:mt-14 md:mt-16 lg:mt-20 max-w-2xl mx-auto px-2 text-[#DEDBC8]">
          <AnimatedLetter
            text="Over the last seven years, I have worked with Parallax, a Berlin-based production house that crafts cinema, series, and Noir Studio in Paris. Together, we have created work that has earned international acclaim at several major festivals."
            className="text-xs sm:text-sm md:text-base leading-relaxed text-center"
          />
        </div>
      </div>
    </section>
  );
}
