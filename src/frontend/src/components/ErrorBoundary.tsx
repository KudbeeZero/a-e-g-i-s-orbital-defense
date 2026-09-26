// Error boundary for graceful crash recovery
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Game Error:", error, errorInfo);
    // Could send to error tracking service here
  }

  handleRestart = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="w-screen h-screen flex flex-col items-center justify-center"
          style={{ background: "#000010" }}
        >
          <div className="text-center">
            <h1
              className="font-display font-black text-5xl tracking-tighter mb-4"
              style={{ color: "#ff3333" }}
            >
              SYSTEM ERROR
            </h1>
            <p
              className="font-hud text-sm tracking-[0.15em] mb-6"
              style={{ color: "rgba(255,51,51,0.7)" }}
            >
              AEGIS ORBITAL DEFENSE HAS ENCOUNTERED A CRITICAL ERROR
            </p>

            <div
              className="bg-opacity-10 p-6 rounded mb-8 max-w-md text-left"
              style={{
                background: "rgba(255,51,51,0.1)",
                border: "1px solid rgba(255,51,51,0.3)",
              }}
            >
              <p
                className="font-hud text-xs"
                style={{ color: "rgba(255,51,51,0.8)" }}
              >
                {this.state.error?.message || "Unknown error"}
              </p>
            </div>

            <button
              type="button"
              onClick={this.handleRestart}
              className="px-8 py-3 font-hud font-bold border-2 transition-all"
              style={{
                borderColor: "#00e5ff",
                color: "#00e5ff",
                background: "rgba(0,229,255,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,229,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,229,255,0.1)";
              }}
            >
              ↻ RESTART SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
