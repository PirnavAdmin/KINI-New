import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "@app/routes/AppRoutes";
import ErrorBoundary from "@shared/components/ErrorBoundary";

const ChatBot = lazy(() => import("@shared/components/ChatBot"));

const AUTH_PATH_PREFIXES = [
  "/login",
  "/register",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/otp-verification",
  "/superadmin/login",
];

const ASSISTANT_EXCLUDED_PATHS = ["/student/mentor-chat"];

const App = () => {
  const { pathname } = useLocation();
  const shouldShowAssistant =
    !AUTH_PATH_PREFIXES.some((path) => pathname.startsWith(path)) &&
    !ASSISTANT_EXCLUDED_PATHS.includes(pathname);

  return (
    <ErrorBoundary>
      <AppRoutes />
      {shouldShowAssistant && (
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      )}
    </ErrorBoundary>
  );
};

export default App;
