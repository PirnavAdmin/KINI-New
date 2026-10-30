import { useCallback, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaRocket,
  FaAward,
  FaUserGraduate,
  FaTrophy,
} from "react-icons/fa";
import useFocusTrap from "@shared/components/navbar/useFocusTrap";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 10,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

const EnquiryWidget = ({ isOpen: controlledIsOpen, onClose: controlledOnClose }) => {
  const [internalShow, setInternalShow] = useState(false);
  const previousFocusRef = useRef(null);

  const isControlled = controlledIsOpen !== undefined;
  const show = isControlled ? controlledIsOpen : internalShow;
  const handleClose = useCallback(() => {
    if (isControlled) controlledOnClose?.();
    else setInternalShow(false);
  }, [controlledOnClose, isControlled]);

  // Auto-show timer (uncontrolled mode only — backward compatibility)
  useEffect(() => {
    if (isControlled) return;
    const timer = setTimeout(() => setInternalShow(true), 3000);
    return () => clearTimeout(timer);
  }, [isControlled]);

  // Body scroll lock
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  // Save and restore focus
  useEffect(() => {
    if (show) {
      previousFocusRef.current = document.activeElement;
    } else if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [show]);

  // Escape key closes the widget
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, handleClose]);

  // Focus trap
  const focusTrapRef = useFocusTrap(show);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            ref={focusTrapRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Book a FREE Career Growth Session"
            className="
              relative
              w-[92vw]
              max-w-[1050px]
              bg-[#1b2230]
              rounded-3xl
              overflow-hidden
              shadow-[0_25px_80px_rgba(0,0,0,0.5)]
              grid
              lg:grid-cols-[34%_66%]
            "
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="
                absolute
                top-4
                right-4
                text-white
                text-xl
                hover:rotate-90
                transition-all
                duration-300
                cursor-pointer
                z-50
              "
              aria-label="Close consultation form"
            >
              <FaTimes />
            </button>

            {/* Left Panel */}
            <div className="bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-600 p-8 flex flex-col justify-center">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Talk to our
                <br />
                Advisor
              </h2>

              <p className="text-2xl text-white/90 mt-4">AND GET</p>

              <div className="mt-8 space-y-5">
                <div className="flex items-center gap-3 text-white text-lg">
                  <FaRocket className="text-yellow-300" />
                  <span>Personalized Career Roadmap</span>
                </div>

                <div className="flex items-center gap-3 text-white text-lg">
                  <FaAward className="text-yellow-300" />
                  <span>Free Career Counseling</span>
                </div>

                <div className="flex items-center gap-3 text-white text-lg">
                  <FaUserGraduate className="text-yellow-300" />
                  <span>Free Access to Master Classes</span>
                </div>

                <div className="flex items-center gap-3 text-white text-lg">
                  <FaTrophy className="text-yellow-300" />
                  <span>Get Job-Ready and Stay Ahead</span>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">
                Book a FREE Career Growth Session!
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label htmlFor="enq-name" className="block mb-2 text-base">
                    Your Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="enq-name"
                    type="text"
                    placeholder="Your Name"
                    className="
                      w-full
                      h-12
                      px-4
                      rounded-xl
                      bg-transparent
                      border
                      border-slate-500
                      outline-none
                      focus:border-cyan-400
                    "
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="enq-email" className="block mb-2 text-base">
                    Email Address <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="enq-email"
                    type="email"
                    placeholder="Email Address"
                    className="
                      w-full
                      h-12
                      px-4
                      rounded-xl
                      bg-transparent
                      border
                      border-slate-500
                      outline-none
                      focus:border-cyan-400
                    "
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label htmlFor="enq-phone" className="block mb-2 text-base">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="enq-phone"
                    type="tel"
                    placeholder="Mobile Number"
                    className="
                      w-full
                      h-12
                      px-4
                      rounded-xl
                      bg-transparent
                      border
                      border-slate-500
                      outline-none
                      focus:border-cyan-400
                    "
                  />
                </div>

                {/* Experience */}
                <div>
                  <label htmlFor="enq-experience" className="block mb-2 text-base">
                    Experience <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="enq-experience"
                    className="
                      w-full
                      h-12
                      px-4
                      rounded-xl
                      bg-transparent
                      border
                      border-slate-500
                      outline-none
                      focus:border-cyan-400
                    "
                  >
                    <option className="text-black">Fresher</option>
                    <option className="text-black">1 Year</option>
                    <option className="text-black">2 Years</option>
                    <option className="text-black">3+ Years</option>
                  </select>
                </div>

                {/* City */}
                <div className="md:col-span-2">
                  <label htmlFor="enq-city" className="block mb-2 text-base">
                    City <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="enq-city"
                    className="
                      w-full
                      h-12
                      px-4
                      rounded-xl
                      bg-transparent
                      border
                      border-slate-500
                      outline-none
                      focus:border-cyan-400
                    "
                  >
                    <option className="text-black">Select City</option>
                    <option className="text-black">Hyderabad</option>
                    <option className="text-black">Bangalore</option>
                    <option className="text-black">Chennai</option>
                  </select>
                </div>
              </div>

              {/* Terms */}
              <div className="mt-5 flex items-center gap-3">
                <input id="enq-terms" type="checkbox" />

                <span className="text-sm text-slate-300">
                  I agree to the{" "}
                  <span className="text-cyan-400 cursor-pointer">
                    Terms and Conditions
                  </span>
                </span>
              </div>

              {/* CTA */}
              <button
                className="
                  w-full
                  mt-6
                  h-12
                  rounded-xl
                  bg-gradient-to-r
                  from-cyan-500
                  to-blue-600
                  text-white
                  font-semibold
                  text-lg
                  hover:scale-[1.02]
                  transition-all
                  duration-300
                  cursor-pointer
                "
              >
                Register For Career Growth
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EnquiryWidget;
