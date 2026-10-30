/**
 * FloatingInput
 * A reusable text/select input with a floating label, glass styling,
 * and inline error messaging. Designed to integrate with React Hook Form
 * via the `register` spread prop.
 *
 * @param {string} id - unique field id, used for label association
 * @param {string} label - floating label text
 * @param {string} [type="text"] - input type (text, email, tel, etc.)
 * @param {object} register - spread of react-hook-form register(name, rules)
 * @param {string} [error] - validation error message, if any
 * @param {Array<string>} [options] - if provided, renders a <select> instead of <input>
 * @param {string} [placeholder] - placeholder used only as a11y fallback (visually hidden)
 */
const FloatingInput = ({ id, label, type = "text", register, error, options, ...rest }) => {
  const baseFieldClasses = `
    w-full bg-slate-900/50 border rounded-xl px-4 pt-5 pb-2 text-sm sm:text-[15px]
    text-white placeholder-transparent outline-none transition-all duration-200
    focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/60
    ${error ? "border-red-500/60 focus:ring-red-400/40" : "border-white/10 hover:border-white/20"}
  `;

  return (
    <div className="relative w-full">
      {options ? (
        <select id={id} {...register} {...rest} className={`${baseFieldClasses} appearance-none cursor-pointer`}>
          <option value="" disabled hidden>
            {label}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-slate-900 text-white">
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          placeholder={label}
          {...register}
          {...rest}
          className={baseFieldClasses}
        />
      )}

      {/* Floating label */}
      <label
        htmlFor={id}
        className="absolute left-4 top-2 text-[11px] font-medium text-slate-400 pointer-events-none transition-colors"
      >
        {label}
      </label>

      {/* Dropdown chevron for select fields */}
      {options && (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
          ▼
        </span>
      )}

      {/* Error message */}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-400 font-medium pl-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default FloatingInput;
