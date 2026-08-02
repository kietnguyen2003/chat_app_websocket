import React from 'react';
import { SpotlightLogo } from '../../spotlight-logo';

interface LandingPageProps {
  onLaunchApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  return (
    <div className="landing-shell">
      {/* Top Navbar */}
      <header className="landing-navbar">
        <div className="landing-nav-brand" onClick={onLaunchApp}>
          <div className="landing-logo-badge">
            <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="landing-brand-title">Spotlight Chat</span>
        </div>

        <nav className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#architecture" className="landing-nav-link">Architecture</a>
          <a href="#demo" className="landing-nav-link">Live Demo</a>
        </nav>

        <div className="landing-nav-actions">
          <button onClick={onLaunchApp} className="landing-cta-btn">
            <span>Launch App</span>
            <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>Realtime WebSocket Engine</span>
          </div>

          <h1 className="hero-title">
            Instant Messaging. <br />
            <span className="gradient-text">Elevated Experience.</span>
          </h1>

          <p className="hero-subtitle">
            Connect seamlessly with sub-millisecond WebSocket delivery, real-time presence indicators, and a clean, luxurious interface designed for modern teams.
          </p>

          <div className="hero-actions">
            <button onClick={onLaunchApp} className="primary-hero-btn">
              <span>Get Started Free</span>
              <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <a href="#demo" className="secondary-hero-btn">
              <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Explore Demo</span>
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">&lt; 10ms</span>
              <span className="stat-label">Latency</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">Realtime Sync</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">Zero</span>
              <span className="stat-label">Lag</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Spotlight Graphic */}
        <div className="hero-graphic-wrap">
          <div className="spotlight-card">
            <div className="spotlight-header">
              <div className="window-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <span className="spotlight-label">Interactive 3D Spotlight</span>
            </div>
            <div className="spotlight-canvas">
              <SpotlightLogo />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features">
        <div className="section-header">
          <span className="section-eyebrow">Powerful Capabilities</span>
          <h2 className="section-title">Engineered for Speed &amp; Elegance</h2>
          <p className="section-subtitle">
            Built from the ground up to deliver a premium messaging experience with modern technology.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon icon-blue">
              <svg className="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="feature-title">WebSocket Realtime Sync</h3>
            <p className="feature-desc">
              Bi-directional, ultra-fast connection delivering messages instantly without page refreshes or polling.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-green">
              <svg className="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="feature-title">Live Presence &amp; Status</h3>
            <p className="feature-desc">
              Track online status in real-time, receive unread message counters, and see active conversation partners.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-purple">
              <svg className="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-23" />
              </svg>
            </div>
            <h3 className="feature-title">Luxury Light Interface</h3>
            <p className="feature-desc">
              Designed with crisp white card containers, soft ambient gradients, custom typography, and micro-animations.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Showcase Section */}
      <section id="demo" className="landing-demo-section">
        <div className="demo-card">
          <div className="demo-content">
            <h2 className="demo-title">Ready to test the realtime experience?</h2>
            <p className="demo-text">
              Sign in or create an account in seconds to start sending live WebSocket messages.
            </p>
            <button onClick={onLaunchApp} className="primary-hero-btn">
              <span>Launch Live Chat App</span>
              <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">Spotlight Chat</span>
            <p className="footer-tagline">Clean, fast, realtime messaging system.</p>
          </div>
          <div className="footer-copy">
            &copy; {new Date().getFullYear()} Spotlight Chat. Built with React 19, WebSockets &amp; Motion.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
