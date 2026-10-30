const navItems = [
  { label: "Our story", sectionId: "about" },
  { label: "Collective", sectionId: "features" },
  { label: "Workshops", sectionId: "features" },
  { label: "Programs", sectionId: "features" },
  { label: "Inquiries", sectionId: "features" },
];

export default function Navbar({ activeSection }) {
  const handleClick = (sectionId) => (e) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
      <div className="bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2 md:px-8">
        <ul className="flex items-center gap-3 sm:gap-6 md:gap-12 lg:gap-14">
          {navItems.map(({ label, sectionId }) => {
            const isActive = activeSection === sectionId;
            return (
              <li key={label}>
                <a
                  href={`#${sectionId}`}
                  onClick={handleClick(sectionId)}
                  className="relative nav-link text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
                  style={{
                    color: isActive
                      ? "#E1E0CC"
                      : "rgba(225, 224, 204, 0.8)",
                  }}
                >
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full bg-[#DEDBC8]" />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
