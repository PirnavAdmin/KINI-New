import { Suspense, createContext, lazy, useCallback, useContext, useMemo, useState } from "react";

const RegisterModal = lazy(() => import("@landing-shared/components/RegisterModal"));
const SuccessModal = lazy(() => import("@landing-shared/components/SuccessModal"));

const ModalContext = createContext(null);

// closed -> register -> success -> closed
export function ModalProvider({ children }) {
  const [stage, setStage] = useState("closed");
  const [selectedCourse, setSelectedCourse] = useState(null);
  // Only start loading the modal chunks the first time they're actually
  // needed, same gating pattern used elsewhere (e.g. Navbar's
  // hasOpenedRegister) — keeps them out of the initial bundle entirely.
  const [hasOpened, setHasOpened] = useState(false);

  const openEnrollment = useCallback((course) => {
    setHasOpened(true);
    setSelectedCourse(course ?? null);
    setStage("register");
  }, []);

  const closeRegister = useCallback(() => {
    setStage("closed");
  }, []);

  const advanceToSuccess = useCallback(() => {
    setStage("success");
  }, []);

  const closeSuccess = useCallback(() => {
    setStage("closed");
    setSelectedCourse(null);
  }, []);

  const value = useMemo(() => ({ openEnrollment }), [openEnrollment]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {hasOpened && (
        <Suspense fallback={null}>
          <RegisterModal
            isOpen={stage === "register"}
            onClose={closeRegister}
            course={selectedCourse}
            onSuccess={advanceToSuccess}
          />
          <SuccessModal isOpen={stage === "success"} onClose={closeSuccess} course={selectedCourse} />
        </Suspense>
      )}
    </ModalContext.Provider>
  );
}

export function useEnrollment() {
  const value = useContext(ModalContext);

  if (!value) {
    throw new Error("useEnrollment must be used within ModalProvider");
  }

  return value;
}
