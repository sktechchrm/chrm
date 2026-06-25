import { useState, useEffect, useCallback } from "react";
import {
  FaShieldAlt,
  FaFileSignature,
  FaSearch,
} from "react-icons/fa";

import { S } from "../shared/styles";
import SubmitView from "../employee/SubmitView";
import TrackView from "../employee/TrackView";
import ManagementView from "../management/ManagementView";
import { apiGet } from "../shared/api";
import type { Grievance } from "../shared/types";

type ViewId = "submit" | "track" | "management";

interface NavItem {
  id: ViewId;
  label: string;
  icon: React.ReactNode;
}

export default function GrievanceModule() {
  // ── Grievance data for ManagementView ──────────────────────────────────────
  const [grievances,  setGrievances]  = useState<Grievance[]>([]);
  const [grLoading,   setGrLoading]   = useState(false);

  const loadGrievances = useCallback(async () => {
    setGrLoading(true);
    try {
      const res = await apiGet({ action: 'getAll' });
      if (res.success && Array.isArray(res.data)) {
        setGrievances((res.data as Grievance[]).slice().reverse());
      }
    } catch { /* silent */ }
    setGrLoading(false);
  }, []);

  useEffect(() => { loadGrievances(); }, [loadGrievances]);

  const [view, setView] = useState<ViewId>("submit");

  const navItems: NavItem[] = [
    {
      id: "submit",
      label: "অভিযোগ দাখিল",
      icon: <FaFileSignature />,
    },
    {
      id: "track",
      label: "অভিযোগ ট্র্যাক",
      icon: <FaSearch />,
    },
    // {
    //   id: "management",
    //   label: "ব্যবস্থাপনা",
    //   icon: <FaTasks />,
    // },
  ];

  return (
    <div style={S.module}>
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Smart Top Header + Navigation */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 999,
          backdropFilter: "blur(18px)",
          background: "rgba(26,26,24,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "14px 16px 12px",
        }}
      >
        {/* Top Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h1
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#fff",
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background:
                  "linear-gradient(135deg, #1D9E75 0%, #15795B 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px rgba(29,158,117,0.25)",
                flexShrink: 0,
              }}
            >
              <FaShieldAlt size={16} color="#fff" />
            </span>

            কর্মী অভিযোগ
          </h1>

          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "#D7D7D4",
              padding: "6px 12px",
              borderRadius: 30,
              fontSize: 11,
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {navItems.find((n) => n.id === view)?.label}
          </div>
        </div>

        {/* Smart Top Nav */}
        <nav
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          {navItems.map((n) => {
            const active = view === n.id;

            return (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                style={{
                  flex: 1,
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 16,
                  padding: "12px 14px",
                  transition: "0.25s ease",
                  background: active
                    ? "linear-gradient(135deg, #1D9E75 0%, #15795B 100%)"
                    : "rgba(255,255,255,0.05)",
                  color: active ? "#fff" : "#C8C8C4",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  boxShadow: active
                    ? "0 10px 25px rgba(29,158,117,0.28)"
                    : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to bottom right, rgba(255,255,255,0.12), transparent)",
                    }}
                  />
                )}

                <div
                  style={{
                    fontSize: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {n.icon}
                </div>

                <span
                  style={{
                    fontSize: 12,
                    fontWeight: active ? 700 : 600,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {n.label}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content */}
      <main style={S.body}>
        {view === "submit" && <SubmitView />}
        {view === "track" && <TrackView />}
        {view === "management" && <ManagementView grievances={grievances} loading={grLoading} onRefresh={loadGrievances} />}
      </main>
    </div>
  );
}