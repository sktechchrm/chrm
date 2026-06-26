// ─────────────────────────────────────────────────────────────────────────────
// WORKER GUIDELINE POPUP MODAL
// QR code popup with standard A4 print and PDF layouts
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import {
  FaTimes, FaQrcode, FaCopy, FaCheck, FaExternalLinkAlt,
  FaFilePdf, FaPrint, FaLink, FaShieldAlt, FaPhone,
} from 'react-icons/fa';
import { getGuidelineConfig } from './workerGuidelineData';
import { getFactoryById } from '../../factories/FactoryRegistry';

// ── QR Display ────────────────────────────────────────────────────────────────
interface QRDisplayProps { url: string; size?: number; onReady?: (dataUrl: string) => void; }

const QRDisplay: React.FC<QRDisplayProps> = ({ url, size = 200, onReady }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);

  useEffect(() => {
    setLoading(true); setError(false);
    const encoded = encodeURIComponent(url);
    const apiUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&ecc=H&margin=10&color=1e3a5f`;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/png');
        setQrDataUrl(dataUrl);
        onReady?.(dataUrl);
      } catch {
        setQrDataUrl(apiUrl);
        onReady?.(apiUrl);
      }
      setLoading(false);
    };
    img.onerror = () => { setError(true); setLoading(false); };
    img.src = apiUrl;
  }, [url, size]);

  if (loading) return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '8px' }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <FaQrcode style={{ fontSize: '32px', marginBottom: '8px' }} />
        <div style={{ fontSize: '12px' }}>Generating QR…</div>
      </div>
    </div>
  );
  if (error) return (
    <div style={{ width: size, height: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', border: '2px dashed #fca5a5', borderRadius: '8px', gap: '8px' }}>
      <FaQrcode style={{ fontSize: '32px', color: '#ef4444' }} />
      <div style={{ fontSize: '11px', color: '#dc2626', textAlign: 'center', padding: '0 8px' }}>QR needs internet. Use the link below.</div>
    </div>
  );
  return <img src={qrDataUrl} alt="Worker Guideline QR Code" style={{ width: size, height: size, display: 'block' }} />;
};

// ── Popup ─────────────────────────────────────────────────────────────────────
interface WorkerGuidelinePopupProps {
  factoryId: string;
  onClose:   () => void;
  onOpen:    () => void;
}

export default function WorkerGuidelinePopup({ factoryId, onClose, onOpen }: WorkerGuidelinePopupProps) {
  const cfg     = getGuidelineConfig(factoryId);
  const factory = getFactoryById(factoryId);
  const profile = factory.workerProfile;
  const [copied,   setCopied]   = useState(false);
  const [qrSrc,    setQrSrc]    = useState<string>('');
  // QR opens the Viewer (card-based interactive experience) via the /view route
  const publicUrl = `${window.location.origin}/rms/worker-guide/${factoryId}/view`;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(publicUrl); }
    catch { const el = document.createElement('textarea'); el.value = publicUrl; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  // ── Print — clean A4, centered QR ──────────────────────────────────────────
  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=794,height=1123');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html lang="bn"><head>
  <meta charset="UTF-8"/>
  <title>Worker Guideline QR — ${factory.nameEn}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      width: 210mm; height: 297mm;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: #fff;
      text-align: center;
    }
    .factory-name {
      font-size: 20px; font-weight: 800;
      color: #1e293b; letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .subtitle {
      font-size: 13px; color: #64748b;
      margin-bottom: 48px;
    }
    .qr-img {
      width: 260px; height: 260px;
      display: block; margin: 0 auto 48px;
    }
    .url {
      font-size: 12px; color: #334155;
      word-break: break-all;
    }
  </style>
</head>
<body onload="window.print(); window.close();">
  <div class="factory-name">${factory.nameEn}</div>
  <div class="subtitle">Worker Guideline — কর্মচারী নির্দেশিকা</div>
  ${qrSrc
    ? `<img class="qr-img" src="${qrSrc}" alt="QR Code" />`
    : `<div style="width:260px;height:260px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;margin:0 auto 48px;font-size:12px;color:#94a3b8;">QR Code</div>`
  }
  <div class="url">${publicUrl}</div>
</body></html>`);
    win.document.close();
  };

  // ── PDF export — clean A4, centered QR, matches print layout ───────────────
  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');

      const pdf  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W    = 210;   // A4 width mm
      const H    = 297;   // A4 height mm
      const cx   = W / 2; // center x

      // ── Factory name ──────────────────────────────────────────────────────
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(30, 41, 59);
      pdf.text(factory.nameEn, cx, 80, { align: 'center' });

      // ── Subtitle ──────────────────────────────────────────────────────────
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Worker Guideline — কর্মচারী নির্দেশিকা', cx, 90, { align: 'center' });

      // ── QR code (centered, large) ─────────────────────────────────────────
      const qrSize = 90; // mm — large and clear
      const qrX    = cx - qrSize / 2;
      const qrY    = 105;

      if (qrSrc && qrSrc.startsWith('data:')) {
        pdf.addImage(qrSrc, 'PNG', qrX, qrY, qrSize, qrSize);
      } else {
        pdf.setFillColor(241, 245, 249);
        pdf.rect(qrX, qrY, qrSize, qrSize, 'F');
        pdf.setFontSize(10); pdf.setTextColor(148, 163, 184);
        pdf.text('QR Code', cx, qrY + qrSize / 2, { align: 'center' });
      }

      // ── URL ───────────────────────────────────────────────────────────────
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(51, 65, 85);
      pdf.text(publicUrl, cx, qrY + qrSize + 18, { align: 'center' });

      pdf.save(`worker-guideline-qr-${factoryId}.pdf`);
    } catch (e) {
      console.error(e);
      alert('PDF export failed. Please use Print instead.');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .wgp-overlay {
          position:fixed;inset:0;z-index:9000;
          background:rgba(15,23,42,0.65);backdrop-filter:blur(6px);
          display:flex;align-items:center;justify-content:center;padding:16px;
          animation:wgp-fade-in 0.2s ease;
        }
        @keyframes wgp-fade-in{from{opacity:0}to{opacity:1}}
        .wgp-modal {
          background:#fff;border-radius:20px;width:100%;max-width:440px;
          box-shadow:0 24px 64px rgba(0,0,0,0.3);overflow:hidden;
          animation:wgp-slide-up 0.25s cubic-bezier(0.22,0.68,0,1.2);
          font-family:'DM Sans',sans-serif;
        }
        @keyframes wgp-slide-up{from{opacity:0;transform:translateY(20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .wgp-topbar{background:linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;}
        .wgp-topbar-title{font-size:16px;font-weight:700;color:#fff;}
        .wgp-topbar-sub{font-size:11px;color:#93c5fd;margin-top:2px;}
        .wgp-topbar-actions{display:flex;align-items:center;gap:8px;}
        .wgp-tb-btn{display:flex;align-items:center;gap:5px;padding:7px 13px;border-radius:8px;border:none;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
        .wgp-tb-btn--print{background:rgba(255,255,255,0.15);color:#fff;}
        .wgp-tb-btn--print:hover{background:rgba(255,255,255,0.25);}
        .wgp-tb-btn--pdf{background:#dc2626;color:#fff;}
        .wgp-tb-btn--pdf:hover{background:#b91c1c;}
        .wgp-close-btn{background:rgba(255,255,255,0.12);border:none;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.15s;font-size:14px;}
        .wgp-close-btn:hover{background:rgba(255,255,255,0.25);}
        .wgp-factory{background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:12px 20px;display:flex;align-items:center;gap:10px;}
        .wgp-factory-icon{width:38px;height:38px;border-radius:10px;background:#eff6ff;color:#1d4ed8;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
        .wgp-factory-name{font-size:13px;font-weight:700;color:#1e293b;}
        .wgp-factory-addr{font-size:11px;color:#64748b;}
        .wgp-body{padding:20px;}
        .wgp-qr-section{display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:20px;}
        .wgp-qr-wrap{padding:12px;background:#fff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.12);border:3px solid #1e40af;}
        .wgp-qr-label{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#1e40af;}
        .wgp-qr-hint{font-size:11px;color:#94a3b8;text-align:center;}
        .wgp-safe-badge{display:flex;align-items:center;gap:5px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;padding:4px 12px;font-size:11px;color:#166534;font-weight:600;}
        .wgp-link-section{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;margin-bottom:16px;}
        .wgp-link-label{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;}
        .wgp-link-row{display:flex;align-items:center;gap:8px;}
        .wgp-link-url{flex:1;font-size:12px;color:#1d4ed8;font-weight:500;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:8px 10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-decoration:none;display:block;}
        .wgp-link-url:hover{background:#dbeafe;}
        .wgp-copy-btn{display:flex;align-items:center;gap:5px;padding:8px 13px;border-radius:6px;border:none;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;white-space:nowrap;font-family:'DM Sans',sans-serif;flex-shrink:0;}
        .wgp-copy-btn--default{background:#0f172a;color:#fff;}
        .wgp-copy-btn--default:hover{background:#1e293b;}
        .wgp-copy-btn--copied{background:#16a34a;color:#fff;}
        .wgp-open-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);color:#fff;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.18s;font-family:'DM Sans',sans-serif;}
        .wgp-open-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(30,64,175,0.4);}
        @media(max-width:480px){.wgp-modal{border-radius:16px;}.wgp-tb-btn span{display:none;}}
      `}</style>

      <div className="wgp-overlay" onClick={onClose}>
        <div className="wgp-modal" onClick={e => e.stopPropagation()}>

          {/* Top bar */}
          <div className="wgp-topbar">
            <div>
              <div className="wgp-topbar-title">Worker Guideline</div>
              <div className="wgp-topbar-sub">কর্মচারী নির্দেশিকা — QR অ্যাক্সেস</div>
            </div>
            <div className="wgp-topbar-actions">
              <button
                className="wgp-tb-btn wgp-tb-btn--print"
                onClick={handlePrint}
                disabled={!qrSrc}
                title={!qrSrc ? 'Waiting for QR code…' : 'Print QR sheet'}
                style={!qrSrc ? {opacity:0.45, cursor:'not-allowed'} : {}}
              >
                <FaPrint /><span>{qrSrc ? 'Print' : '…'}</span>
              </button>
              <button
                className="wgp-tb-btn wgp-tb-btn--pdf"
                onClick={handleExportPDF}
                disabled={!qrSrc}
                title={!qrSrc ? 'Waiting for QR code…' : 'Export PDF'}
                style={!qrSrc ? {opacity:0.45, cursor:'not-allowed'} : {}}
              >
                <FaFilePdf /><span>{qrSrc ? 'PDF' : '…'}</span>
              </button>
              <button className="wgp-close-btn" onClick={onClose}><FaTimes /></button>
            </div>
          </div>

          {/* Factory strip */}
          <div className="wgp-factory">
            <div className="wgp-factory-icon">🏭</div>
            <div>
              <div className="wgp-factory-name">{factory.nameEn}</div>
              <div className="wgp-factory-addr">{factory.addressEn}</div>
            </div>
          </div>

          {/* Body */}
          <div className="wgp-body">
            <div className="wgp-qr-section">
              <div className="wgp-qr-label"><FaQrcode /> স্ক্যান করুন — শ্রমিক নির্দেশিকা দেখতে</div>
              <div className="wgp-qr-wrap">
                <QRDisplay url={publicUrl} size={200} onReady={setQrSrc} />
              </div>
              <div className="wgp-safe-badge"><FaShieldAlt /> কোনো লগইন প্রয়োজন নেই — সরাসরি অ্যাক্সেস</div>
              <div className="wgp-qr-hint">মোবাইলের ক্যামেরা দিয়ে QR কোড স্ক্যান করুন</div>
              {/* QR ready status for print/pdf */}
              {qrSrc ? (
                <div style={{fontSize:'11px',color:'#16a34a',fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
                  <FaCheck style={{fontSize:'10px'}}/> QR ready — Print &amp; PDF enabled
                </div>
              ) : (
                <div style={{fontSize:'11px',color:'#f59e0b',fontWeight:600}}>
                  ⏳ Loading QR — please wait before printing…
                </div>
              )}
            </div>

            <div className="wgp-link-section">
              <div className="wgp-link-label"><FaLink /> পাবলিক লিংক</div>
              <div className="wgp-link-row">
                <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="wgp-link-url" title={publicUrl}>
                  {publicUrl}
                </a>
                <button className={`wgp-copy-btn ${copied ? 'wgp-copy-btn--copied' : 'wgp-copy-btn--default'}`} onClick={handleCopy}>
                  {copied ? <FaCheck /> : <FaCopy />}{copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <button className="wgp-open-btn" onClick={onOpen}>
              <FaExternalLinkAlt /> সম্পূর্ণ নির্দেশিকা দেখুন
            </button>
          </div>
        </div>
      </div>
    </>
  );
}