import { FaWhatsapp, FaHeart } from "react-icons/fa";
import { SUPPORT } from '../../config/support';

const Footer = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .footer-root {
          position: fixed;
          bottom: 0; left: 0;
          width: 100%;
          height: var(--footer-h, 40px);
          background: #0f172a;
          border-top: 1px solid rgba(255,255,255,0.07);
          z-index: 1000;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
        }
        .footer-inner {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .footer-copy {
          font-size: 11px;
          color: #475569;
          white-space: nowrap;
          letter-spacing: 0.2px;
        }
        .footer-copy span {
          color: #64748b;
        }
        .footer-dev {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #475569;
          white-space: nowrap;
          overflow: hidden;
        }
        .footer-dev-name {
          color: #64748b;
          font-weight: 500;
          display: none;
        }
        @media (min-width: 480px) {
          .footer-dev-name { display: inline; }
        }
        .footer-wa {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #22c55e;
          font-weight: 600;
          text-decoration: none;
          font-size: 11px;
          transition: color 0.15s ease;
          white-space: nowrap;
        }
        .footer-wa:hover { color: #4ade80; }
        .footer-wa svg { font-size: 14px; flex-shrink: 0; }
        .footer-wa-number { display: none; }
        @media (min-width: 540px) {
          .footer-wa-number { display: inline; }
        }
        .footer-dot {
          color: #1e293b;
          font-size: 10px;
        }
      `}</style>

      <footer className="footer-root print:hidden">
        <div className="footer-inner">
          {/* Left */}
          <p className="footer-copy">
            © {new Date().getFullYear()} <span>HR Technology</span>
          </p>

          {/* Right */}
          <div className="footer-dev">
            <span className="footer-dev-name">Developed by Saiful Islam</span>
            <span className="footer-dot">·</span>
            <a
              href={SUPPORT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-wa"
            >
              <FaWhatsapp aria-hidden="true" />
              <span className="footer-wa-number">+880 1732-484884</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;