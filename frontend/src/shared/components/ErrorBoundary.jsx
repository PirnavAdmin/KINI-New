import { Component } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";

/**
 * ErrorBoundary
 *
 * Catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <AppRoutes />
 *   </ErrorBoundary>
 *
 * Or wrap individual lazy-loaded routes:
 *   <ErrorBoundary>
 *     <SuspenseWrapper>
 *       <Login />
 *     </SuspenseWrapper>
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      webglContextLost: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidMount() {
    // Detect WebGL context loss globally — the GPU can drop the context
    // asynchronously after a prior JS error corrupted render state.
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('webglcontextlost', this.handleWebGLContextLost);
    }

    // A successful app mount means a previous chunk-recovery attempt can be retired.
    window.setTimeout(() => {
      window.sessionStorage.removeItem('kini:chunk-recovery-attempted');
    }, 5000);
  }

  componentWillUnmount() {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.removeEventListener('webglcontextlost', this.handleWebGLContextLost);
    }
  }

  handleWebGLContextLost = (event) => {
    event.preventDefault();
    console.warn('⚠️ WebGL context lost — likely caused by a prior JS error or GPU overload');
    this.setState({ webglContextLost: true, hasError: true });
    // Allow restoring context after 1 second
    setTimeout(() => {
      if (event.target) {
        event.target.getContext('webgl2') || event.target.getContext('webgl');
      }
    }, 1000);
  };

  componentDidCatch(error, errorInfo) {
    console.group('❌ ErrorBoundary caught an error:');
    console.error('Error:', error);
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Component Stack:', errorInfo?.componentStack);

    // Detect WebGL-related errors specifically
    const isWebGLError =
      error.message?.includes('WebGL') ||
      error.message?.includes('webgl') ||
      error.message?.includes('context') ||
      error.message?.includes('R3F') ||
      error.message?.includes('THREE');

    if (isWebGLError) {
      console.warn('🖥️ This error originated in the WebGL/Three.js rendering pipeline');
      console.warn('💡 Check for: invalid geometries, NaN positions, missing textures, or excessive draw calls');
    }

    console.groupEnd();
    this.setState({ errorInfo });

    const errorMessage = error?.message || '';
    const isChunkError =
      errorMessage.includes('Loading chunk') ||
      errorMessage.includes('dynamically imported') ||
      errorMessage.includes('Failed to fetch');

    // Vite/browser caches can retain an old lazy chunk after a deployment or HMR update.
    // Reload once automatically, while preserving the fallback for real persistent failures.
    if (
      isChunkError &&
      !window.sessionStorage.getItem('kini:chunk-recovery-attempted')
    ) {
      window.sessionStorage.setItem('kini:chunk-recovery-attempted', '1');
      window.location.reload();
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoBack = () => {
    this.handleReset();
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      // Allow custom fallback via props
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage =
        this.state.error?.message || "An unexpected error occurred";
      const isChunkError =
        errorMessage.includes("Loading chunk") ||
        errorMessage.includes("dynamically imported") ||
        errorMessage.includes("Failed to fetch");

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1220] p-4">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-[28px] bg-gradient-to-br from-red-500/10 to-orange-500/10 flex items-center justify-center ring-1 ring-red-500/20">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {isChunkError
                ? "Failed to Load Module"
                : "Something Went Wrong"}
            </h1>

            {/* Error Description */}
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
              {isChunkError ? (
                <>
                  A module failed to load. This is usually caused by a
                  network interruption or a recent deployment change.
                </>
              ) : (
                <>
                  An unexpected error occurred in the application. Our team
                  has been notified.
                </>
              )}
            </p>

            {/* Technical Details (collapsible in non-production) */}
            {import.meta.env.DEV && (
              <details className="mb-6 text-left">
                <summary className="text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors select-none">
                  Technical Details
                </summary>
                <div className="mt-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/40 overflow-auto max-h-48">
                  <p className="text-xs font-mono text-red-500 mb-2 break-all">
                    {errorMessage}
                  </p>
                  {this.state.error?.stack && (
                    <pre className="text-[10px] font-mono text-slate-500 dark:text-slate-400 whitespace-pre-wrap break-all leading-relaxed">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {isChunkError ? (
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </button>
              ) : (
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              )}
              <button
                onClick={this.handleGoBack}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <Link
                to="/"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-[#0f55f7] hover:text-[#0f55f7] dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
            </div>

            {/* Support */}
            <p className="mt-8 text-xs text-slate-400">
              If the problem persists, please contact support at{" "}
              <span className="font-medium text-slate-500 dark:text-slate-300">
                support@kinieduhub.io
              </span>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

