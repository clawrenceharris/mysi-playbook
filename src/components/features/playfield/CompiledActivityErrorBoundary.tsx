import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  activitySlug?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CompiledActivityErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Compiled activity error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Activity Error</h2>
          </div>
          <p className="text-muted-foreground text-center max-w-md">
            There was an error running this activity. This may be due to an
            issue with the compiled activity code.
          </p>
          {this.props.activitySlug && (
            <p className="text-sm text-muted-foreground">
              Activity: {this.props.activitySlug}
            </p>
          )}
          {this.state.error && (
            <details className="text-sm text-muted-foreground max-w-md">
              <summary className="cursor-pointer">Error details</summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-2">
            <Button onClick={this.handleReset} variant="secondary">
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
