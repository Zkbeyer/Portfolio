import { Component, type ReactNode } from "react";

/** If the 3D room throws (lost/blocked WebGL context, driver bugs), drop it and let the poster show. */
export class CanvasBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
