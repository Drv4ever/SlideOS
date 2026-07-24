import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
          <div className="max-w-md text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center mx-auto">
              <span className="text-white text-lg font-bold">!</span>
            </div>
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer border-t border-white/20 border-x border-white/10"
            >
              Go Home
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              className="bg-sidebar-accent hover:bg-sidebar-accent/80 text-foreground text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer border border-border"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}