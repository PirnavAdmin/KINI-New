import PropTypes from "prop-types";
import { X } from "lucide-react";
export default function ImageViewer({ src, alt, onClose }) { if (!src) return null; return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/85 p-6"><button type="button" onClick={onClose} className="absolute right-6 top-6 text-white" aria-label="Close image"><X /></button><img src={src} alt={alt} className="max-h-full max-w-full rounded-xl object-contain" /></div>; }
ImageViewer.propTypes = { src: PropTypes.string, alt: PropTypes.string, onClose: PropTypes.func.isRequired };
