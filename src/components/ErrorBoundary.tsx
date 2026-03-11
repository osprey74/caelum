import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-6 text-center">
          <p className="text-red-400 text-lg mb-2">描画エラーが発生しました</p>
          <p className="text-gray-500 text-sm mb-4">{this.state.error?.message}</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded bg-gray-700 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
          >
            再試行
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
