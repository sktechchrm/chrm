import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// LawRefIcon / LawRefPanel — a small "i" icon next to a calculation label
// that, on click, opens a panel row below it showing the relevant Bangladesh
// Labour Act 2006 reference (text centralized in ./lawReferences.ts).
//
// USAGE — only one panel open at a time within a table:
//
//   const [openRef, setOpenRef] = useState<string | null>(null);
//   const toggleRef = (id: string) => setOpenRef(prev => (prev === id ? null : id));
//
//   <td>
//     <span className="flex items-center gap-1.5">
//       লেবেল
//       <LawRefIcon id="myRowId" openId={openRef} onToggle={toggleRef} />
//     </span>
//   </td>
//   ...
//   {openRef === "myRowId" && <LawRefPanel colSpan={3} text={LAW_REFERENCES.someKey} />}
// ─────────────────────────────────────────────────────────────────────────────

interface LawRefIconProps {
  id: string;
  openId: string | null;
  onToggle: (id: string) => void;
}

export const LawRefIcon: React.FC<LawRefIconProps> = ({ id, openId, onToggle }) => (
  <button
    type="button"
    onClick={() => onToggle(id)}
    aria-label="আইনি রেফারেন্স দেখুন"
    aria-expanded={openId === id}
    className={`inline-flex items-center justify-center w-4 h-4 shrink-0 transition-colors outline-none ${
      openId === id ? "text-blue-600" : "text-gray-400 hover:text-blue-500"
    }`}
  >
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  </button>
);

interface LawRefPanelProps {
  colSpan: number;
  text: string;
}

export const LawRefPanel: React.FC<LawRefPanelProps> = ({ colSpan, text }) => (
  <tr className="bg-blue-50">
    <td colSpan={colSpan} className="px-4 py-2.5 text-xs text-blue-900 leading-relaxed border-b border-blue-100">
      {text}
    </td>
  </tr>
);