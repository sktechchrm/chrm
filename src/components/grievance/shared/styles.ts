import type { CSSProperties } from "react";
import { STATUS_COLORS, URGENCY_COLORS } from "./constants";

// --- মোবাইল-ফার্স্ট স্টাইল ---
export const S = {
  module: {
    fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
    minHeight: "100vh",
    background: "#F4F3EF",
    color: "#1a1a18",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
  } as CSSProperties,

  // Fixed top header
  header: {
    background: "#1a1a18",
    color: "#fff",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 1px 0 rgba(255,255,255,0.06)",
  } as CSSProperties,

  headerTitle: {
    fontSize: 15,
    fontWeight: 700,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 8,
  } as CSSProperties,

  // Fixed bottom nav bar
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 480,
    background: "#fff",
    borderTop: "0.5px solid rgba(0,0,0,0.1)",
    display: "flex",
    zIndex: 100,
    paddingBottom: "env(safe-area-inset-bottom)",
  } as CSSProperties,

  bottomNavBtn: (active: boolean): CSSProperties => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 4px 8px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: active ? "#1D9E75" : "#888780",
    fontFamily: "inherit",
    gap: 3,
    transition: "color 0.15s",
  }),

  bottomNavLabel: (active: boolean): CSSProperties => ({
    fontSize: 10,
    fontWeight: active ? 700 : 500,
    color: active ? "#1D9E75" : "#888780",
    letterSpacing: "0.01em",
  }),

  // Scrollable body with bottom nav padding
  body: {
    padding: "16px 16px 90px",
  } as CSSProperties,

  card: {
    background: "#fff",
    borderRadius: 14,
    border: "0.5px solid rgba(0,0,0,0.08)",
    padding: "16px",
    marginBottom: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  } as CSSProperties,

  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    margin: "0 0 16px",
    color: "#1a1a18",
    display: "flex",
    alignItems: "center",
    gap: 8,
  } as CSSProperties,

  // Single column form for mobile
  formCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  } as CSSProperties,

  formGroup: { display: "flex", flexDirection: "column", gap: 6 } as CSSProperties,

  label: { fontSize: 13, fontWeight: 600, color: "#444441" } as CSSProperties,

  input: {
    border: "0.5px solid rgba(0,0,0,0.18)",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 15,
    outline: "none",
    background: "#fff",
    color: "#1a1a18",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
    WebkitAppearance: "none",
  } as CSSProperties,

  select: {
    border: "0.5px solid rgba(0,0,0,0.18)",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 15,
    outline: "none",
    background: "#fff",
    color: "#1a1a18",
    fontFamily: "inherit",
    cursor: "pointer",
    width: "100%",
    boxSizing: "border-box",
    WebkitAppearance: "none",
  } as CSSProperties,

  textarea: {
    border: "0.5px solid rgba(0,0,0,0.18)",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 15,
    outline: "none",
    background: "#fff",
    color: "#1a1a18",
    fontFamily: "inherit",
    minHeight: 110,
    resize: "vertical",
    width: "100%",
    boxSizing: "border-box",
    WebkitAppearance: "none",
  } as CSSProperties,

  // Full-width primary button
  btnPrimary: {
    background: "#1a1a18",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px 20px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "inherit",
    width: "100%",
    letterSpacing: "-0.01em",
  } as CSSProperties,

  btnSecondary: {
    background: "transparent",
    color: "#1a1a18",
    border: "0.5px solid rgba(0,0,0,0.18)",
    borderRadius: 12,
    padding: "12px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "inherit",
  } as CSSProperties,

  badge: (status: string): CSSProperties => ({
    background: (STATUS_COLORS[status] || "#888780") + "18",
    color: STATUS_COLORS[status] || "#888780",
    border: `0.5px solid ${(STATUS_COLORS[status] || "#888780")}55`,
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 700,
    display: "inline-block",
    whiteSpace: "nowrap",
  }),

  urgencyBadge: (urgency: string): CSSProperties => ({
    background: (URGENCY_COLORS[urgency] || URGENCY_COLORS["কম"]).bg,
    color: (URGENCY_COLORS[urgency] || URGENCY_COLORS["কম"]).text,
    border: `0.5px solid ${(URGENCY_COLORS[urgency] || URGENCY_COLORS["কম"]).border}`,
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 700,
    display: "inline-block",
  }),

  anonBadge: {
    background: "#F3EEFF",
    color: "#6B4FC8",
    border: "0.5px solid #C4AAEE",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 700,
    display: "inline-block",
  } as CSSProperties,

  alertSuccess: {
    background: "#EAF3DE",
    border: "0.5px solid #97C459",
    borderRadius: 12,
    padding: "14px 16px",
    color: "#27500A",
    marginBottom: "12px",
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  } as CSSProperties,

  alertError: {
    background: "#FCEBEB",
    border: "0.5px solid #F09595",
    borderRadius: 12,
    padding: "14px 16px",
    color: "#A32D2D",
    marginBottom: "12px",
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  } as CSSProperties,

  // Toggle switch for anonymous
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#F4F3EF",
    borderRadius: 12,
    padding: "14px 16px",
    border: "0.5px solid rgba(0,0,0,0.08)",
  } as CSSProperties,

  toggleTrack: (on: boolean): CSSProperties => ({
    width: 48,
    height: 28,
    borderRadius: 14,
    background: on ? "#6B4FC8" : "#D3D1C7",
    position: "relative",
    cursor: "pointer",
    transition: "background 0.2s",
    flexShrink: 0,
    border: "none",
    outline: "none",
  }),

  toggleThumb: (on: boolean): CSSProperties => ({
    position: "absolute",
    top: 3,
    left: on ? 23 : 3,
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
    transition: "left 0.2s",
  }),

  // Info box
  infoBox: {
    background: "#F3EEFF",
    border: "0.5px solid #C4AAEE",
    borderRadius: 12,
    padding: "12px 14px",
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 12,
  } as CSSProperties,

  // Bottom sheet / modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 200,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  } as CSSProperties,

  sheet: {
    background: "#fff",
    borderRadius: "20px 20px 0 0",
    width: "100%",
    maxWidth: 480,
    maxHeight: "92vh",
    overflowY: "auto",
    padding: "20px 16px 40px",
  } as CSSProperties,

  sheetHandle: {
    width: 36,
    height: 4,
    background: "#D3D1C7",
    borderRadius: 2,
    margin: "0 auto 18px",
  } as CSSProperties,

  // Urgency selector pills
  pillRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  } as CSSProperties,

  pill: (active: boolean, color: string): CSSProperties => ({
    padding: "8px 14px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: `1.5px solid ${active ? color : "rgba(0,0,0,0.12)"}`,
    background: active ? color + "18" : "#fff",
    color: active ? color : "#888780",
    fontFamily: "inherit",
    transition: "all 0.15s",
  }),

  // Detail info rows
  infoRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 0",
    borderBottom: "0.5px solid #F0EFE9",
  } as CSSProperties,
};

// Urgency pill colors
export const URGENCY_PILL_COLORS: Record<string, string> = {
  "কম":     "#3B6D11",
  "মাঝারি": "#854F0B",
  "বেশি":   "#993C1D",
  "জরুরি":  "#A32D2D",
};