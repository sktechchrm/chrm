import { useState, useEffect } from "react";
import type { Grievance } from "../shared/types";
import { apiGet } from "../shared/api";
import { S } from "../shared/styles";
import FlowBoard from "../shared/FlowBoard";
import {
  FaCrosshairs,
  FaSpinner,
  FaSearch,
  FaExclamationCircle,
  FaUserAltSlash,
  FaUser,
  FaBuilding,
  FaTag,
  FaCalendarAlt,
} from "react-icons/fa";

// --- অগ্রগতি ট্র্যাক ---
interface TrackViewProps {
  /** Pre-load this GRV ID when the user clicks a record in the right panel */
  initialId?: string;
}

export default function TrackView({ initialId }: TrackViewProps) {
  const [query, setQuery] = useState<string>("");
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (id?: string): Promise<void> => {
    const searchId = (id ?? query).trim();
    if (!searchId) { setError("একটি অভিযোগ আইডি প্রবেশ করুন।"); return; }
    setLoading(true);
    setError(null);
    setGrievance(null);
    try {
      const res = await apiGet({ action: "getOne", id: searchId });
      if (res.success) setGrievance(res.data as Grievance);
      else setError("অভিযোগ পাওয়া যায়নি। আইডিটি পুনরায় যাচাই করুন।");
    } catch {
      setError("নেটওয়ার্ক ত্রুটি। পুনরায় চেষ্টা করুন।");
    }
    setLoading(false);
  };

  // Auto-search when initialId is injected (e.g. from record panel click)
  useEffect(() => {
    if (initialId) {
      setQuery(initialId);
      search(initialId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  const isAnon = (grievance as Grievance & { IsAnonymous?: string })?.IsAnonymous === "YES";

  // Map icon keys to react-icon components
  const rowIcons: Record<string, React.ReactNode> = {
    user:     <FaUser style={{ fontSize: 15, color: "#888780", marginTop: 1, flexShrink: 0 }} />,
    userOff:  <FaUserAltSlash style={{ fontSize: 15, color: "#888780", marginTop: 1, flexShrink: 0 }} />,
    building: <FaBuilding style={{ fontSize: 15, color: "#888780", marginTop: 1, flexShrink: 0 }} />,
    tag:      <FaTag style={{ fontSize: 15, color: "#888780", marginTop: 1, flexShrink: 0 }} />,
    calendar: <FaCalendarAlt style={{ fontSize: 15, color: "#888780", marginTop: 1, flexShrink: 0 }} />,
  };

  return (
    <div>
      <h2 style={S.sectionTitle}>
        <FaCrosshairs style={{ fontSize: 20, color: "#378ADD" }} />
        অগ্রগতি ট্র্যাক
      </h2>

      {/* সার্চ বক্স */}
      <div style={S.card}>
        <div style={S.formGroup}>
          <label style={S.label}>অভিযোগ আইডি</label>
          <input
            style={S.input}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="GRV-1719123456789"
            onKeyDown={e => e.key === "Enter" && search()}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <button style={S.btnPrimary} onClick={() => search()} disabled={loading}>
            {loading
              ? <><FaSpinner style={{ fontSize: 18, animation: "spin 1s linear infinite" }} /> খোঁজা হচ্ছে…</>
              : <><FaSearch style={{ fontSize: 18 }} /> অগ্রগতি দেখুন</>
            }
          </button>
        </div>
      </div>

      {error && (
        <div style={S.alertError}>
          <FaExclamationCircle style={{ fontSize: 18, flexShrink: 0 }} />
          <div style={{ fontSize: 14 }}>{error}</div>
        </div>
      )}

      {grievance && (
        <>
          {/* অভিযোগ শিরোনাম কার্ড */}
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#888780", fontWeight: 600, marginBottom: 3, letterSpacing: "0.05em" }}>অভিযোগ আইডি</div>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.02em" }}>{grievance.ID}</div>
              </div>
              <span style={S.badge(grievance.Status)}>{grievance.Status}</span>
            </div>

            {/* Urgency + Anonymous badges */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              <span style={S.urgencyBadge(grievance.Urgency)}>{grievance.Urgency}</span>
              {isAnon && <span style={S.anonBadge}>🕵️ বেনামী</span>}
            </div>

            {/* বিবরণ rows */}
            {[
              !isAnon && { iconKey: "user",     label: "কর্মী",          val: `${grievance.Name} (${grievance.EmployeeID})` },
              isAnon  && { iconKey: "userOff",  label: "কর্মী",          val: "বেনামী (পরিচয় গোপন)" },
              { iconKey: "building", label: "বিভাগ",          val: grievance.Department },
              { iconKey: "tag",      label: "অভিযোগের ধরন",  val: grievance.Category },
              { iconKey: "calendar", label: "দাখিলের তারিখ", val: grievance.SubmittedAt ? new Date(grievance.SubmittedAt).toLocaleDateString("bn-BD") : "—" },
            ].filter(Boolean).map((d) => {
              const item = d as { iconKey: string; label: string; val: string };
              return (
                <div key={item.label} style={S.infoRow}>
                  {rowIcons[item.iconKey]}
                  <div>
                    <div style={{ fontSize: 11, color: "#B0ADA6", marginBottom: 1 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: isAnon && item.label === "কর্মী" ? "#888780" : "#1a1a18" }}>{item.val}</div>
                  </div>
                </div>
              );
            })}

            {/* বিবরণ */}
            <div style={{ marginTop: 14, background: "#F4F3EF", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#888780", marginBottom: 6, fontWeight: 700, letterSpacing: "0.05em" }}>বিবরণ</div>
              <div style={{ fontSize: 14, color: "#1a1a18", lineHeight: 1.7 }}>{grievance.Description}</div>
            </div>
          </div>

          {/* ফ্লো বোর্ড কার্ড */}
          <div style={S.card}>
            <FlowBoard grievance={grievance} />
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}