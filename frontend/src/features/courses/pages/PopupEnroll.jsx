import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import EnrollmentForm from "./EnrollmentForm";

function EnrollmentPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const popupShown = localStorage.getItem("enrollment-popup");

    if (!popupShown) {
      const timer = setTimeout(() => {
        setOpen(true);
        localStorage.setItem("enrollment-popup", "true");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        bg-black/60
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-4
      "
    >
      <div
        className="
          relative
          w-full
          max-w-6xl
          max-h-[90vh]
          overflow-y-auto
          rounded-3xl
        "
      >
        <button
          onClick={() => setOpen(false)}
          className="
            absolute
            top-4
            right-4
            z-50
            w-10
            h-10
            rounded-full
            bg-white
            shadow-lg
            flex
            items-center
            justify-center
            cursor-pointer
            hover:bg-gray-200
            transition
          "
        >
          <FaTimes />
        </button>

        <EnrollmentForm />
      </div>
    </div>
  );
}

export default EnrollmentPopup;