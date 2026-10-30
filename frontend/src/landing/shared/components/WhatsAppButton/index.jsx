import { FaWhatsapp } from "react-icons/fa6";

export default function WhatsAppButton() {
  const message = encodeURIComponent(
    "Hi, I would like to know more about Kini. Please share more information about your courses, programs, and services."
  );

  return (
    <a
      href={`https://wa.me/919000198239?text=${message}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/20 transition-transform hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="h-7 w-7" aria-hidden="true" />
    </a>
  );
}