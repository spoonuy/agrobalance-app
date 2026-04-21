import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('AgroBalance runtime error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="card">
          <h3>Ocurrió un error en esta pantalla</h3>
          <p>{this.state.error.message || 'Error desconocido'}</p>
          {this.state.error.stack ? <pre className="error-stack">{this.state.error.stack}</pre> : null}
        </div>
      );
    }

    return this.props.children;
  }
}
