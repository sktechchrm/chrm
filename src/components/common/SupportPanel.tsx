// src/components/common/SupportPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Support interface — contact info, FAQ, and message form.
// Rendered inside ProfilePanel when user clicks the Support section.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { SUPPORT } from '../../config/support';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import AppButton from './AppButton';
import {
  FaWhatsapp, FaEnvelope, FaPhone, FaChevronDown,
  FaChevronUp, FaTimes, FaCheckCircle, FaHeadset,
} from 'react-icons/fa';

interface SupportPanelProps {
  onClose: () => void;
}

const CONTACT = {
  whatsapp:  SUPPORT.whatsappNumber,
  whatsappDisplay: SUPPORT.whatsappDisplay,
  email:     'support@sk-tech.com.bd',
  phone:     '+880-1732-484884',
  hours:     'Sun – Thu, 9:00 AM – 6:00 PM (BST)',
};

const FAQS = [
  {
    q: 'How do I reset my password?',
    a: 'Contact your system administrator or SK-TECH support via WhatsApp or email. Passwords are managed centrally.',
  },
  {
    q: 'Why can\'t I access a certain module?',
    a: 'Module access is controlled by your role. Contact your admin to request access to additional modules.',
  },
  {
    q: 'How do I switch between factories?',
    a: 'If you have multi-factory access, use the factory badge in the top navigation bar to switch. Only parent-factory users can access sub-factories.',
  },
  {
    q: 'PDF or Excel export is not working?',
    a: 'Ensure your browser allows pop-ups for this site. For PDF, try refreshing the page first. For Excel, check that your Downloads folder is accessible.',
  },
  {
    q: 'How do I add a new employee or committee member?',
    a: 'Navigate to the relevant module (Personal File, Meeting Minutes, etc.) and use the form section to enter new records.',
  },
  {
    q: 'Is my data saved automatically?',
    a: 'Most modules auto-save to local storage. For permanent records, always use the Print or Export function after completing a form.',
  },
];

export default function SupportPanel({ onClose }: SupportPanelProps) {
  const [openFaq,      setOpenFaq]      = useState<number | null>(null);
  const [msgName,      setMsgName]      = useState('');
  const [msgText,      setMsgText]      = useState('');
  const [msgSent,      setMsgSent]      = useState(false);
  const [sending,      setSending]      = useState(false);

  // Focus trap
  const trapRef = useFocusTrap(true);

  const handleSend = () => {
    if (!msgText.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setMsgSent(true);
      setMsgName('');
      setMsgText('');
    }, 900);
  };

  return (
    <>
      <style>{`
        .sp-root { display:flex; flex-direction:column; height:100%; background:#0f172a; font-family:'DM Sans',sans-serif; }

        /* ── Header ── */
        .sp-header {
          background: linear-gradient(135deg, #0c2340 0%, #0f3460 100%);
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: flex-start; gap: 14px; flex-shrink: 0;
        }
        .sp-header-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; color: #fff; flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
        }
        .sp-header-text { flex: 1; }
        .sp-header-title { font-size: 16px; font-weight: 700; color: #f1f5f9; line-height: 1.2; }
        .sp-header-sub { font-size: 11.5px; color: #64748b; margin-top: 3px; }
        .sp-back-btn {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(255,255,255,0.07); border: none; color: #94a3b8;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0; transition: all 0.15s;
        }
        .sp-back-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }

        /* ── Body ── */
        .sp-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 20px; }
        .sp-body::-webkit-scrollbar { width: 4px; }
        .sp-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        /* ── Section ── */
        .sp-section-title {
          font-size: 9.5px; font-weight: 700; color: #475569;
          text-transform: uppercase; letter-spacing: 1.2px;
          margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
        }
        .sp-section-title::after { content:''; flex:1; height:1px; background:rgba(255,255,255,0.06); }

        /* ── Contact cards ── */
        .sp-contacts { display: flex; flex-direction: column; gap: 8px; }
        .sp-contact-card {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          text-decoration: none; transition: all 0.15s; cursor: pointer;
        }
        .sp-contact-card:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.14); transform: translateX(3px); }
        .sp-contact-icon {
          width: 36px; height: 36px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .sp-contact-icon.wa  { background: rgba(37,211,102,0.15); color: #25d366; }
        .sp-contact-icon.em  { background: rgba(59,130,246,0.15); color: #60a5fa; }
        .sp-contact-icon.ph  { background: rgba(168,85,247,0.15); color: #a855f7; }
        .sp-contact-label { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; }
        .sp-contact-value { font-size: 13px; font-weight: 600; color: #e2e8f0; margin-top: 1px; }
        .sp-contact-badge { margin-left: auto; font-size: 10px; color: #64748b; white-space: nowrap; }
        .sp-hours { font-size: 11px; color: #475569; text-align: center; padding: 4px 0; }

        /* ── FAQ ── */
        .sp-faq { display: flex; flex-direction: column; gap: 6px; }
        .sp-faq-item {
          border-radius: 9px; border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03); overflow: hidden;
          transition: border-color 0.15s;
        }
        .sp-faq-item.open { border-color: rgba(59,130,246,0.3); }
        .sp-faq-q {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          gap: 10px; padding: 11px 14px; background: transparent; border: none;
          cursor: pointer; font-family: 'DM Sans',sans-serif; text-align: left;
          transition: background 0.12s;
        }
        .sp-faq-q:hover { background: rgba(255,255,255,0.04); }
        .sp-faq-q-text { font-size: 12.5px; font-weight: 600; color: #cbd5e1; line-height: 1.3; }
        .sp-faq-item.open .sp-faq-q-text { color: #93c5fd; }
        .sp-faq-icon { font-size: 11px; color: #475569; flex-shrink: 0; transition: color 0.15s; }
        .sp-faq-item.open .sp-faq-icon { color: #3b82f6; }
        .sp-faq-a { padding: 0 14px 12px; font-size: 12px; color: #94a3b8; line-height: 1.65; }

        /* ── Message form ── */
        .sp-form { display: flex; flex-direction: column; gap: 10px; }
        .sp-input-label { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 5px; display: block; }
        .sp-input, .sp-textarea {
          width: 100%; padding: 9px 12px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; color: #e2e8f0; font-family: 'DM Sans',sans-serif; font-size: 13px;
          outline: none; transition: border-color 0.2s, background 0.2s; resize: none;
        }
        .sp-input::placeholder, .sp-textarea::placeholder { color: #334155; }
        .sp-input:focus, .sp-textarea:focus {
          border-color: #3b82f6; background: rgba(59,130,246,0.07);
        }
        .sp-textarea { min-height: 90px; }
        .sp-send-row { display: flex; justify-content: flex-end; gap: 8px; }
        .sp-sent-banner {
          display: flex; align-items: center; gap: 10px; padding: 12px 16px;
          background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25);
          border-radius: 10px; font-size: 13px; color: #4ade80; font-weight: 600;
          animation: spFadeIn 0.3s ease;
        }
        @keyframes spFadeIn { from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);} }
      `}</style>

      <div
        className="sp-root"
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Support panel"
      >

        {/* Header */}
        <div className="sp-header">
          <div className="sp-header-icon"><FaHeadset aria-hidden="true" /></div>
          <div className="sp-header-text">
            <div className="sp-header-title">SK-TECH Support</div>
            <div className="sp-header-sub">Get help from our support team</div>
          </div>
          <button className="sp-back-btn" onClick={onClose} title="Back to profile" aria-label="Close support panel">
            <FaTimes aria-hidden="true"/>
          </button>
        </div>

        <div className="sp-body">

          {/* Contact */}
          <div>
            <div className="sp-section-title"><FaPhone style={{fontSize:'9px'}}/> Contact Us</div>
            <div className="sp-contacts">
              <a className="sp-contact-card" href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <div className="sp-contact-icon wa"><FaWhatsapp aria-hidden="true" /></div>
                <div>
                  <div className="sp-contact-label">WhatsApp</div>
                  <div className="sp-contact-value">{CONTACT.whatsappDisplay}</div>
                </div>
                <div className="sp-contact-badge">Tap to open →</div>
              </a>
              <a className="sp-contact-card" href={`mailto:${CONTACT.email}`}>
                <div className="sp-contact-icon em"><FaEnvelope aria-hidden="true" /></div>
                <div>
                  <div className="sp-contact-label">Email</div>
                  <div className="sp-contact-value">{CONTACT.email}</div>
                </div>
                <div className="sp-contact-badge">Send email →</div>
              </a>
              <a className="sp-contact-card" href={`tel:${CONTACT.phone}`}>
                <div className="sp-contact-icon ph"><FaPhone aria-hidden="true" /></div>
                <div>
                  <div className="sp-contact-label">Phone</div>
                  <div className="sp-contact-value">{CONTACT.phone}</div>
                </div>
              </a>
              <div className="sp-hours">🕘 Office hours: {CONTACT.hours}</div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <div className="sp-section-title">Frequently Asked Questions</div>
            <div className="sp-faq">
              {FAQS.map((faq, i) => (
                <div key={i} className={`sp-faq-item ${openFaq === i ? 'open' : ''}`}>
                  <AppButton variant="icon" className="sp-faq-q !w-auto !h-auto !rounded-none !px-4 !py-3 w-full text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className="sp-faq-q-text">{faq.q}</span>
                    {openFaq === i ? <FaChevronUp className="sp-faq-icon"/> : <FaChevronDown className="sp-faq-icon"/>}
                  </AppButton>
                  {openFaq === i && <div className="sp-faq-a">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Message form */}
          <div>
            <div className="sp-section-title">Send a Message</div>
            {msgSent ? (
              <div className="sp-sent-banner">
                <FaCheckCircle style={{fontSize:'16px'}}/>
                Message received! We'll get back to you within 24 hours.
              </div>
            ) : (
              <div className="sp-form">
                <div>
                  <label className="sp-input-label">Your Name</label>
                  <input
                    className="sp-input" type="text" placeholder="Enter your name"
                    value={msgName} onChange={e => setMsgName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="sp-input-label">Message</label>
                  <textarea
                    className="sp-textarea" placeholder="Describe your issue or question..."
                    value={msgText} onChange={e => setMsgText(e.target.value)}
                  />
                </div>
                <div className="sp-send-row">
                  <AppButton variant="primary" disabled={!msgText.trim() || sending} onClick={handleSend}>
                    {sending ? 'Sending…' : 'Send Message'}
                  </AppButton>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
