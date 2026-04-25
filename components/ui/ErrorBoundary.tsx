"use client";

/**
 * Granular React error boundary for wrapping individual widgets.
 *
 * Use this when you want a single broken card or chart not to take down the
 * entire dashboard. For full-page errors, prefer Next.js `app/**\/error.tsx`
 * or the root `app/global-error.tsx` instead.
 *
 * Example:
 *   <ErrorBoundary fallback={<EmptyChart />} onError={reportToSentry}>
 *     <BillingChart />
 *   </ErrorBoundary>
 */
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Optional fallback UI shown when an error is caught. Receives the error
   * and a reset callback for retry buttons. Defaults to a small Arabic-RTL
   * card with a retry button.
   */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Called once per caught error. Use to forward to Sentry/Langfuse. */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Optional debug label written to logs to identify the wrapped surface. */
  label?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (this.props.onError) {
      try {
        this.props.onError(error, info);
      } catch {
        // never let the reporter break the boundary
      }
    }
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    const { fallback } = this.props;
    if (typeof fallback === "function") return fallback(error, this.reset);
    if (fallback !== undefined) return fallback;

    return (
      <div
        role="alert"
        dir="rtl"
        className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-right text-sm text-red-200"
      >
        <p className="mb-2 font-semibold text-red-100">حدث خطأ في هذا المكوّن</p>
        <p className="mb-3 text-red-300/80">{error.message || "خطأ غير متوقع"}</p>
        <button
          type="button"
          onClick={this.reset}
          className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-100 hover:bg-red-500/20"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
