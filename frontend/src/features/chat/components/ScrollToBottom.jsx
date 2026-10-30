import PropTypes from "prop-types";
import { ChevronDown } from "lucide-react";
export default function ScrollToBottom({ onClick }) { return <button type="button" onClick={onClick} className="absolute bottom-4 right-5 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-lg hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800" aria-label="Scroll to latest message"><ChevronDown size={18} /></button>; }
ScrollToBottom.propTypes = { onClick: PropTypes.func.isRequired };
