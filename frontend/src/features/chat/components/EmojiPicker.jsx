import PropTypes from "prop-types";
const emojis = ["😀", "😊", "👍", "👏", "🎉", "🔥", "💡", "✅", "🙏", "💻", "📚", "🚀"];
export default function EmojiPicker({ onSelect }) { return <div className="absolute bottom-14 left-2 z-20 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-800"><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Frequently used</p><div className="grid grid-cols-6 gap-1">{emojis.map((emoji) => <button type="button" key={emoji} onClick={() => onSelect(emoji)} className="grid h-9 place-items-center rounded-lg text-xl hover:bg-slate-100 dark:hover:bg-slate-700">{emoji}</button>)}</div></div>; }
EmojiPicker.propTypes = { onSelect: PropTypes.func.isRequired };
