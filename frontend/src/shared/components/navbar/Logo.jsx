import { memo } from "react";

const Logo = memo(function Logo() {
  return (
    <a href="/" className="brand-logo-viewport group flex h-10 w-[156px] flex-shrink-0 items-center justify-center" aria-label="Kini home">
      <img src="/assets/new-logo-f.jpg.jpeg" alt="Kini — Learn. Innovate. Lead." className="brand-logo-image transition-transform duration-200 group-hover:scale-[1.03]" />
    </a>
  );
});

export default Logo;

