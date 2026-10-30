import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { CornerDownLeft, Search } from "lucide-react";

/**
 * v23 — header search from the Kini designs ("Search students, courses, batches…  ⌘K").
 * It searches the pages in the sidebar the user can see (labels + section) and
 * opens the chosen one; ⌘K / Ctrl+K focuses it. Page data is searched on each page.
 */
function readSidebarPages() {
  const seen = new Set();
  return [...document.querySelectorAll("[data-dashboard-role] aside a[href]")]
    .map((link) => ({ label: (link.getAttribute("aria-label") || link.textContent || "").trim(), href: link.getAttribute("href") }))
    .filter((item) => item.label && !/^kini eduhub$/i.test(item.label) && item.href && item.href.startsWith("/") && item.href !== "/" && !seen.has(item.href) && seen.add(item.href));
}

export default function HeaderSearch({ placeholder }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState([]);
  const [active, setActive] = useState(0);
  const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform || "");

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    const onDown = (event) => { if (!boxRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, []);

  const term = query.trim().toLowerCase();
  const results = (term ? pages.filter((page) => page.label.toLowerCase().includes(term)) : pages).slice(0, 8);
  const go = (page) => { if (!page) return; setOpen(false); setQuery(""); inputRef.current?.blur(); navigate(page.href); };

  return (
    <div className="kini-hsearch" ref={boxRef}>
      <Search className="kini-hsearch__icon" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="kini-hsearch-list"
        aria-label="Search pages"
        placeholder={placeholder}
        value={query}
        onFocus={() => { setPages(readSidebarPages()); setOpen(true); setActive(0); }}
        onChange={(event) => { setQuery(event.target.value); setOpen(true); setActive(0); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => Math.min(value + 1, results.length - 1)); }
          else if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => Math.max(value - 1, 0)); }
          else if (event.key === "Enter") { event.preventDefault(); go(results[active]); }
          else if (event.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
        }}
      />
      <kbd className="kini-hsearch__kbd" aria-hidden="true">{isMac ? "⌘" : "Ctrl"} K</kbd>
      {open && (
        <ul id="kini-hsearch-list" role="listbox" className="kini-hsearch__list">
          {results.length ? results.map((page, index) => (
            <li key={page.href} role="option" aria-selected={index === active}>
              <button type="button" className={index === active ? "is-active" : ""} onMouseEnter={() => setActive(index)} onClick={() => go(page)}>
                <span>{page.label}</span>{index === active && <CornerDownLeft aria-hidden="true" />}
              </button>
            </li>
          )) : <li className="kini-hsearch__none">No pages match “{query}”.</li>}
        </ul>
      )}
    </div>
  );
}

HeaderSearch.propTypes = { placeholder: PropTypes.string };
