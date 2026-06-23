import { useState, useEffect } from "react";
import type { FlowBoardProps, HistoryEntry } from "./types";
import { FLOW_STEPS, STATUS_COLORS } from "./constants";
import { S } from "./styles";
import * as FaIcons from "react-icons/fa";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Safely resolve a react-icons/fa component by name string; falls back to FaCircle. */
const resolveIcon = (name: string): React.ElementType => {
  const found = FaIcons[name as keyof typeof FaIcons];
  return (typeof found === "function" ? found : FaIcons.FaCircle) as React.ElementType;
};

/** Progress fraction 0–1 for the track line fill */
const progressFraction = (currentIdx: number): number =>
  currentIdx <= 0 ? 0 : currentIdx / (FLOW_STEPS.length - 1);

// ── Sub-components ────────────────────────────────────────────────────────────

/** Horizontal stepper — for web (wide screens ≥ 500px) */
function HorizontalStepper({ currentStepIndex }: { currentStepIndex: number }) {
  const pct = progressFraction(currentStepIndex) * 100;
  const activeColor = FLOW_STEPS[currentStepIndex]?.color || "#1D9E75";

  return (
    <div style={{ position: "relative", marginBottom: "2rem", overflow: "visible" }}>
      {/* Track */}
      <div style={{
        position: "absolute", top: 20,
        left: `calc(100% / ${FLOW_STEPS.length * 2})`,
        right: `calc(100% / ${FLOW_STEPS.length * 2})`,
        height: 2, background: "#E8E7E3", zIndex: 0,
      }} />
      {/* Fill */}
      <div style={{
        position: "absolute", top: 20,
        left: `calc(100% / ${FLOW_STEPS.length * 2})`,
        width: `calc(${pct}% * ${(FLOW_STEPS.length - 1) / FLOW_STEPS.length})`,
        height: 2, background: activeColor,
        zIndex: 1, transition: "width 0.4s ease",
      }} />

      {/* Steps row */}
      <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
        {FLOW_STEPS.map((step, i) => {
          const isDone    = i <= currentStepIndex;
          const isCurrent = i === currentStepIndex;
          const Icon      = resolveIcon(step.icon);

          return (
            <div
              key={step.status}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                flex: 1, minWidth: 0,            // ← prevents flex blowout
              }}
            >
              {/* Circle */}
              <div style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                background: isDone ? step.color : "#F7F6F2",
                border: isCurrent
                  ? `3px solid ${step.color}`
                  : isDone ? `2px solid ${step.color}` : "1.5px solid #D3D1C7",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isCurrent ? `0 0 0 4px ${step.color}22` : "none",
                transition: "all 0.25s ease",
              }}>
                <Icon style={{ fontSize: 15, color: isDone ? "#fff" : "#B4B2A9" }} />
              </div>

              {/* Label — truncated with ellipsis if too wide */}
              <div style={{
                marginTop: 5, fontSize: 10,
                fontWeight: isCurrent ? 700 : isDone ? 600 : 400,
                color: isDone ? step.color : "#888780",
                textAlign: "center",
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                padding: "0 2px",
                lineHeight: 1.3,
              }}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Vertical stepper — for Android / narrow screens (< 500px) */
function VerticalStepper({ currentStepIndex }: { currentStepIndex: number }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {FLOW_STEPS.map((step, i) => {
        const isDone    = i <= currentStepIndex;
        const isCurrent = i === currentStepIndex;
        const isLast    = i === FLOW_STEPS.length - 1;
        const Icon      = resolveIcon(step.icon);

        return (
          <div key={step.status} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            {/* Left: circle + connector line */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: isDone ? step.color : "#F7F6F2",
                border: isCurrent
                  ? `3px solid ${step.color}`
                  : isDone ? `2px solid ${step.color}` : "1.5px solid #D3D1C7",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isCurrent ? `0 0 0 4px ${step.color}22` : "none",
                transition: "all 0.25s ease",
                flexShrink: 0,
              }}>
                <Icon style={{ fontSize: 14, color: isDone ? "#fff" : "#B4B2A9" }} />
              </div>
              {/* Connector line — hidden for last step */}
              {!isLast && (
                <div style={{
                  width: 2, height: 20,
                  background: i < currentStepIndex ? step.color : "#E8E7E3",
                  margin: "3px 0",
                  transition: "background 0.25s ease",
                }} />
              )}
            </div>

            {/* Right: label + status badge */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flex: 1, minWidth: 0,
              paddingTop: 8,
              paddingBottom: isLast ? 0 : 12,
            }}>
              <span style={{
                fontSize: 13,
                fontWeight: isCurrent ? 700 : isDone ? 600 : 400,
                color: isDone ? step.color : "#888780",
                lineHeight: 1.3,
              }}>
                {step.label}
              </span>

              {isCurrent && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: step.color + "18",
                  color: step.color,
                  border: `1px solid ${step.color}44`,
                  borderRadius: 20,
                  padding: "2px 8px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  marginLeft: 8,
                }}>
                  বর্তমান
                </span>
              )}

              {isDone && !isCurrent && (
                <FaIcons.FaCheckCircle style={{ fontSize: 13, color: step.color, flexShrink: 0, marginLeft: 8 }} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function FlowBoard({ grievance }: FlowBoardProps) {
  // Responsive breakpoint detection
  const [isNarrow, setIsNarrow] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 500 : false
  );

  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < 500);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const history: HistoryEntry[] = (() => {
    try {
      return typeof grievance.History === "string"
        ? (JSON.parse(grievance.History) as HistoryEntry[])
        : (grievance.History as HistoryEntry[]) || [];
    } catch { return []; }
  })();

  const currentStepIndex = FLOW_STEPS.findIndex(s => s.status === grievance.Status);
  const reversedHistory  = [...history].reverse();

  return (
    <div>
      {/* ── Progress stepper — layout switches on width ── */}
      {isNarrow
        ? <VerticalStepper currentStepIndex={currentStepIndex} />
        : <HorizontalStepper currentStepIndex={currentStepIndex} />
      }

      {/* ── Timeline history ── */}
      <div style={{ borderTop: "0.5px solid #E8E7E3", paddingTop: "1.25rem" }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: "#444441",
          marginBottom: "1rem", letterSpacing: "0.04em",
        }}>
          গৃহীত পদক্ষেপ ও ইতিহাস
        </div>

        {reversedHistory.length === 0 && (
          <div style={{ color: "#888780", fontSize: 14, textAlign: "center", padding: "1rem 0" }}>
            এখনো কোনো পদক্ষেপ নেই।
          </div>
        )}

        {reversedHistory.map((h, i) => {
          const matchedStep = FLOW_STEPS.find(s => s.status === h.status);
          const TimelineIcon = resolveIcon(matchedStep?.icon || "FaCircle");
          const statusColor  = STATUS_COLORS[h.status] || matchedStep?.color || "#1D9E75";

          return (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: "1rem" }}>
              {/* Icon column */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: statusColor + "12",
                  border: `1px solid ${statusColor}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <TimelineIcon style={{ fontSize: 13, color: statusColor }} />
                </div>
                {i < reversedHistory.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: "#E8E7E3", margin: "4px 0" }} />
                )}
              </div>

              {/* Content column */}
              <div style={{ flex: 1, minWidth: 0, paddingBottom: 12 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  marginBottom: 4, flexWrap: "wrap",
                }}>
                  <span style={S.badge(h.status)}>{h.status}</span>
                  <span style={{ fontSize: 11, color: "#888780" }}>
                    {h.at ? new Date(h.at).toLocaleString("bn-BD") : ""}
                  </span>
                </div>
                <div style={{
                  fontSize: 14, color: "#1a1a18",
                  marginBottom: 3, lineHeight: 1.6,
                  wordBreak: "break-word",          // ← prevents long text overflow
                }}>
                  {h.note}
                </div>
                {h.by && (
                  <div style={{ fontSize: 12, color: "#888780" }}>— {h.by}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
