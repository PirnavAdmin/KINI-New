import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

function WhatsAppButton() {
  const phoneNumber = "919951029900";

  const message =
    "Hi Pirnav Edutech, I would like to know more about your courses and free career consultation.";

  return (
    <motion.a
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.15,
      }}
      className="
        fixed
        bottom-6
        right-6
        z-[9999]
        flex
        items-center
        gap-3
        bg-green-500
        text-white
        px-5
        py-4
        rounded-full
        shadow-[0_10px_30px_rgba(34,197,94,0.4)]
        hover:bg-green-600
        transition-all
        duration-300
      "
    >
      <FaWhatsapp className="text-3xl" />

    </motion.a>
  );
}

export default WhatsAppButton;