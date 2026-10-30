import { Suspense, lazy } from "react";
import { cn } from "@/lib/utils";

// Spline's runtime is large, so it loads as its own chunk only when a scene renders.
const Spline = lazy(() => import("@splinetool/react-spline"));

export function SplineScene({ scene, className, fallbackClassName }) {
  return (
    <Suspense
      fallback={
        <div className={cn("flex h-full w-full items-center justify-center", fallbackClassName)}>
          <span
            aria-hidden="true"
            className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#FFB51B] motion-reduce:animate-none"
          />
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
