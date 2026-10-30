# Kini EduHub

React + Vite app with Student, Mentor, Organization, and HR portals.

Stack: React 19, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui (Radix), React Router, Framer Motion, Recharts, Axios.

Commands: `npm run dev`, `npm run build`, `npm run lint`, `npm test`.

## Frontend UI work

For any frontend UI change, use the `frontend-design` skill (plugin `frontend-design@claude-plugins-official`).

- Modern, professional SaaS look; improve hero banners and image placement.
- Keep KPI cards consistent across portals.
- Polish tables, filters, forms, and modals.
- Consistent typography, colors, spacing, and shadows; reuse existing shadcn components and design tokens before adding new ones.
- Extract reusable components where a pattern repeats.
- Responsive on desktop, tablet, and mobile.
- Match the user's reference screenshots as closely as possible.
- Optimize image loading (lazy loading, sized images) and avoid needless re-renders.
- Layout must hold at 100% browser zoom — never use CSS `zoom` or `transform: scale` to fit content.

## Boundaries

Do not change backend APIs, authentication, routing, or business logic unless explicitly asked. Do not replace the existing application architecture.
