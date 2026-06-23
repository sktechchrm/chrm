// ─────────────────────────────────────────────────────────────────────────────
// SkipNav — Skip-to-main-content link (WCAG 2.1 §2.4.1 "Bypass Blocks")
//
// Invisible by default; becomes visible on keyboard focus (Tab key).
// Allows keyboard-only and screen-reader users to jump past the navigation
// bar directly to the main content area.
//
// Usage:
//   1. Place <SkipNav /> as the very first element inside <body>.
//   2. Make sure the main content container has id="main-content".
// ─────────────────────────────────────────────────────────────────────────────

export default function SkipNav() {
  return (
    <>
      <style>{`
        .skip-nav {
          position: fixed;
          top: -100%;
          left: 12px;
          z-index: 99999;
          padding: 10px 20px;
          background: #1e3a5f;
          color: #ffffff;
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: 600;
          border-radius: 0 0 8px 8px;
          text-decoration: none;
          transition: top 0.15s ease;
          border: 2px solid #60a5fa;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .skip-nav:focus {
          top: 0;
          outline: 3px solid #60a5fa;
          outline-offset: 2px;
        }
      `}</style>
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>
    </>
  );
}
