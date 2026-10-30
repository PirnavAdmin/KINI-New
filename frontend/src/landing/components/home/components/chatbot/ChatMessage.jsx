// ============================================================
// ChatMessage.jsx — renders every response type
// ============================================================
import { motion } from "framer-motion";
import { ExternalLink, MessageCircle } from "lucide-react";
import { kiniKnowledgeBase as KB } from "./chatbotData";

const GRAD = "linear-gradient(135deg, #133B5D 0%, #35608A 50%, #F39924 100%)";

// Simple markdown-lite: **bold** and \n→<br>
function RichText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith("**") ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          p.split("\n").map((line, j, arr) => (
            <span key={j}>
              {line}
              {j < arr.length - 1 && <br />}
            </span>
          ))
        )
      )}
    </span>
  );
}

function ContactBtn() {
  const { whatsapp, email } = KB.institute;
  if (!whatsapp && !email) return null;
  const href = whatsapp || `mailto:${email}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary-500 text-primary-700 border border-secondary-500 transition-all duration-300 hover:bg-secondary-600"
    >
      <MessageCircle size={13} />
      Talk to Kini Edx Hub
    </a>
  );
}

function CourseCard({ course, compact = false }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 mb-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">
            🎓 {course.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{course.description}</p>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 shrink-0">
          {course.level}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <Badge icon="📚" label={course.mode} />
        {course.duration && <Badge icon="⏱" label={course.duration} />}
        {course.fee     && <Badge icon="💰" label={course.fee} highlight />}
        {!course.fee    && <span className="text-xs text-slate-400 dark:text-slate-500 italic">Fee: contact us</span>}
      </div>
      {!compact && course.highlights && (
        <ul className="mt-2 space-y-0.5">
          {course.highlights.slice(0, 4).map((h, i) => (
            <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <span className="text-green-500">•</span> {h}
            </li>
          ))}
        </ul>
      )}
      {course.enrollUrl && (
        <a
          href={course.enrollUrl}
          className="inline-flex items-center gap-1 mt-2 text-xs font-semibold bg-secondary-500 text-primary-700 border border-secondary-500 px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-secondary-600"
        >
          Enroll <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
}

function Badge({ icon, label, highlight }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        highlight
          ? "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300"
          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
      }`}
    >
      {icon} {label}
    </span>
  );
}

// ── Message renderer ─────────────────────────────────────────
export default function ChatMessage({ message, isDark, onQuickAction }) {
  const { role, data } = message;
  const isBot = role === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`flex ${isBot ? "justify-start" : "justify-end"} mb-3`}
    >
      {isBot && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs mr-2 mt-0.5 shrink-0 font-bold"
          style={{ background: GRAD }}
        >
          K
        </div>
      )}

      <div className={`max-w-[88%] ${isBot ? "" : "items-end"}`}>
        {/* ── User bubble ── */}
        {!isBot && (
          <div
            className="px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-sm text-white"
            style={{ background: GRAD }}
          >
            {message.text}
          </div>
        )}

        {/* ── Bot responses ── */}
        {isBot && renderBotContent(data, isDark, onQuickAction)}
      </div>
    </motion.div>
  );
}

function BotBubble({ children }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 shadow-sm">
      {children}
    </div>
  );
}

function renderBotContent(data, isDark, onQuickAction) {
  if (!data) return null;

  switch (data.type) {
    // ── Plain text ────────────────────────────────────────
    case "text":
      return (
        <BotBubble>
          <RichText text={data.text} />
          {data.showContact && <ContactBtn />}
          {data.showQuickActions && (
            <QuickActionGrid onQuickAction={onQuickAction} mini />
          )}
        </BotBubble>
      );

    // ── About ─────────────────────────────────────────────
    case "about":
      return (
        <BotBubble>
          <p className="mb-2"><RichText text={data.text} /></p>
          <div className="space-y-1.5 mt-2">
            {data.benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <span>{b.icon}</span>
                <div>
                  <p className="font-semibold text-xs text-slate-800 dark:text-slate-100">{b.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </BotBubble>
      );

    // ── Course list ───────────────────────────────────────
    case "course_list":
      return (
        <BotBubble>
          <p className="font-semibold mb-2">🎓 Our Courses</p>
          {data.courses.map(c => <CourseCard key={c.id} course={c} />)}
        </BotBubble>
      );

    // ── Course detail ─────────────────────────────────────
    case "course_detail":
      return (
        <BotBubble>
          <CourseCard course={data.course} />
        </BotBubble>
      );

    // ── Course price ──────────────────────────────────────
    case "course_price":
      return (
        <BotBubble>
          <p className="font-semibold mb-1">💰 {data.course.name} — Fee</p>
          {data.course.fee ? (
            <p className="text-base font-bold text-green-600 dark:text-green-400">{data.course.fee}</p>
          ) : (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                The current fee for this course isn't listed here yet.
              </p>
              <ContactBtn />
            </>
          )}
        </BotBubble>
      );

    // ── Course duration ───────────────────────────────────
    case "course_duration":
      return (
        <BotBubble>
          <p className="font-semibold mb-1">⏱ {data.course.name} — Duration</p>
          {data.course.duration ? (
            <p className="text-sm">{data.course.duration}</p>
          ) : (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Duration details for this course aren't listed here yet.
              </p>
              <ContactBtn />
            </>
          )}
        </BotBubble>
      );

    // ── Course mode ───────────────────────────────────────
    case "course_mode":
      return (
        <BotBubble>
          <p className="font-semibold mb-1">📚 {data.course.name} — Mode</p>
          <Badge icon={data.modeInfo?.icon || "📖"} label={data.course.mode} />
          {data.modeInfo && (
            <ul className="mt-2 space-y-0.5">
              {data.modeInfo.points.map((p, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <span className="text-primary-400">•</span> {p}
                </li>
              ))}
            </ul>
          )}
        </BotBubble>
      );

    // ── Price overview ────────────────────────────────────
    case "price_overview":
      return (
        <BotBubble>
          <p className="font-semibold mb-2">💰 Course Fees</p>
          {data.withPrice.length > 0 && data.withPrice.map(c => (
            <div key={c.id} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <span className="text-sm">{c.name}</span>
              <span className="font-bold text-green-600 dark:text-green-400 text-sm">{c.fee}</span>
            </div>
          ))}
          {data.without.length > 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">
              {data.without.map(c => c.shortName).join(", ")} — fee available on request.
            </p>
          )}
          {data.withPrice.length === 0 && (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Current pricing isn't listed in the chatbot yet.
              </p>
              <ContactBtn />
            </>
          )}
        </BotBubble>
      );

    // ── Duration overview ─────────────────────────────────
    case "duration_overview":
      return (
        <BotBubble>
          <p className="font-semibold mb-2">⏱ Course Durations</p>
          {data.courses.map(c => (
            <div key={c.id} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <span className="text-sm">{c.name}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{c.duration || "Contact us"}</span>
            </div>
          ))}
        </BotBubble>
      );

    // ── Learning modes ────────────────────────────────────
    case "learning_modes":
      return (
        <BotBubble>
          <p className="font-semibold mb-2">📚 Learning Modes</p>
          {data.modes.map(m => (
            <div key={m.mode} className="mb-2">
              <p className="font-semibold text-xs mb-0.5">{m.icon} {m.mode}</p>
              <ul className="space-y-0.5">
                {m.points.map((p, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex gap-1">
                    <span className="text-primary-400 shrink-0">•</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">
            Mode varies per course. See each course card for details.
          </p>
          {data.courses.map(c => (
            <div key={c.id} className="flex justify-between py-0.5">
              <span className="text-xs">{c.name}</span>
              <Badge icon="" label={c.mode} />
            </div>
          ))}
        </BotBubble>
      );

    // ── Training process ──────────────────────────────────
    case "training_process":
      return (
        <BotBubble>
          <p className="font-semibold mb-2">🛤 How Kini Edx Hub Training Works</p>
          <div className="space-y-2">
            {data.steps.map((s, i) => (
              <div key={i} className="flex gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: GRAD }}
                >
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-xs text-slate-800 dark:text-slate-100">{s.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </BotBubble>
      );

    // ── Teaching style ────────────────────────────────────
    case "teaching_style":
      return (
        <BotBubble>
          <p className="font-semibold mb-2">👨‍🏫 How Our Mentors Teach</p>
          <ul className="space-y-1">
            {data.items.map((item, i) => (
              <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex gap-1.5">
                <span className="text-green-500 shrink-0">✓</span> {item}
              </li>
            ))}
          </ul>
        </BotBubble>
      );

    // ── Benefits ──────────────────────────────────────────
    case "benefits":
      return (
        <BotBubble>
          <p className="font-semibold mb-2">⭐ What You Get at Kini Edx Hub</p>
          {data.benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-2 mb-2">
              <span className="text-base">{b.icon}</span>
              <div>
                <p className="font-semibold text-xs text-slate-800 dark:text-slate-100">{b.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{b.description}</p>
              </div>
            </div>
          ))}
        </BotBubble>
      );

    // ── Placement ─────────────────────────────────────────
    case "placement":
      return (
        <BotBubble>
          <p className="font-semibold mb-2">💼 Career & Placement Assistance</p>
          <ul className="space-y-1">
            {data.items.map((item, i) => (
              <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex gap-1.5">
                <span className="text-green-500 shrink-0">✓</span> {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-2">
            Support availability may vary by program.
          </p>
        </BotBubble>
      );

    // ── Enrollment ────────────────────────────────────────
    case "enroll":
      return (
        <BotBubble>
          <p className="font-semibold mb-2">📝 How to Enroll</p>
          <ol className="space-y-1 list-decimal list-inside">
            {data.steps.map((s, i) => (
              <li key={i} className="text-xs text-slate-600 dark:text-slate-300">{s}</li>
            ))}
          </ol>
        </BotBubble>
      );

    // ── Compare ───────────────────────────────────────────
    case "compare": {
      const [a, b] = data.courses;
      const rows = [
        { label: "Category",  a: a.category,  b: b.category },
        { label: "Level",     a: a.level,     b: b.level },
        { label: "Mode",      a: a.mode,      b: b.mode },
        { label: "Duration",  a: a.duration || "—", b: b.duration || "—" },
        { label: "Fee",       a: a.fee || "Contact us", b: b.fee || "Contact us" },
      ];
      return (
        <BotBubble>
          <p className="font-semibold mb-2">⚖️ {a.shortName} vs {b.shortName}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-1 text-left text-slate-400 dark:text-slate-500 font-medium"></th>
                  <th className="py-1 text-center font-semibold text-slate-700 dark:text-slate-200">{a.shortName}</th>
                  <th className="py-1 text-center font-semibold text-slate-700 dark:text-slate-200">{b.shortName}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-1 pr-2 text-slate-400 dark:text-slate-500">{r.label}</td>
                    <td className="py-1 text-center text-slate-700 dark:text-slate-200">{r.a}</td>
                    <td className="py-1 text-center text-slate-700 dark:text-slate-200">{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BotBubble>
      );
    }

    // ── Recommend: start / question ───────────────────────
    case "recommend_start":
    case "recommend_question": {
      const question = data.question || data.text;
      return (
        <BotBubble>
          <p className="mb-2"><RichText text={question} /></p>
          {data.options && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {data.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => onQuickAction({ text: opt, recommendState: data.nextState })}
                  className="text-xs px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </BotBubble>
      );
    }

    // ── Recommend result ──────────────────────────────────
    case "recommend_result":
      return (
        <BotBubble>
          <p className="font-semibold mb-2">🎯 {data.reason}</p>
          {data.courses.map(c => <CourseCard key={c.id} course={c} />)}
        </BotBubble>
      );

    // ── FAQ ───────────────────────────────────────────────
    case "faq":
      return (
        <BotBubble>
          <p className="font-semibold mb-2">❓ Frequently Asked Questions</p>
          <div className="space-y-2">
            {data.faqs.map((f, i) => (
              <div key={i}>
                <p className="font-semibold text-xs text-slate-800 dark:text-slate-100">Q: {f.q}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">A: {f.a}</p>
              </div>
            ))}
          </div>
        </BotBubble>
      );

    // ── Contact ───────────────────────────────────────────
    case "contact":
      return (
        <BotBubble>
          <p className="mb-1">
            I'd be happy to connect you with the Kini Edx Hub team directly. 👇
          </p>
          {(data.whatsapp || data.email) ? (
            <ContactBtn />
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">
              Contact details will appear here once configured by the Kini Edx Hub team.
            </p>
          )}
        </BotBubble>
      );

    // ── Mentor list ───────────────────────────────────────
    case "mentor_list":
      return (
        <BotBubble>
          <p className="font-semibold mb-2">👨‍🏫 Our Mentors</p>
          {data.mentors.map((m, i) => (
            <div key={i} className="mb-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700">
              <p className="font-semibold text-sm">{m.name}</p>
              {m.role && <p className="text-xs text-slate-500 dark:text-slate-400">{m.role}</p>}
              {m.experience && <p className="text-xs text-slate-400">{m.experience} experience</p>}
              {m.expertise && <div className="flex flex-wrap gap-1 mt-1">{m.expertise.map((e, j) => <Badge key={j} label={e} />)}</div>}
            </div>
          ))}
        </BotBubble>
      );

    default:
      return (
        <BotBubble>
          <p>Something went wrong. Please try again.</p>
        </BotBubble>
      );
  }
}

// ── Quick action mini grid ────────────────────────────────────
function QuickActionGrid({ onQuickAction, mini }) {
  const actions = [
    { label: "🎓 Explore Courses",    text: "What courses do you offer?" },
    { label: "💰 Course Prices",       text: "What are the course fees?" },
    { label: "📚 Course Types",        text: "What types of courses are available?" },
    { label: "🎥 Live or Recorded?",   text: "Are courses live or recorded?" },
    { label: "👨‍🏫 Meet Our Mentors",   text: "Tell me about your mentors" },
    { label: "🛠 How Training Works",  text: "How does training work?" },
    { label: "💼 Career Support",      text: "What career support do you offer?" },
    { label: "📝 How to Enroll",       text: "How do I enroll?" },
  ];
  return (
    <div className={`flex flex-wrap gap-1.5 ${mini ? "mt-2" : "mt-0"}`}>
      {actions.map((a, i) => (
        <button
          key={i}
          onClick={() => onQuickAction({ text: a.text })}
          className="text-xs px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

export { QuickActionGrid };