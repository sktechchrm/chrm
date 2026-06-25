import { useState, useEffect } from "react";
import type { Grievance, UpdateForm, UpdateMsg } from "../shared/types";
import { FLOW_STEPS, STATUS_COLORS } from "../shared/constants";
import { apiGet, apiPost } from "../shared/api";
import { S } from "../shared/styles";
import FlowBoard from "../shared/FlowBoard";
import {
  FaThLarge, FaSpinner, FaInbox, FaExclamationCircle,
  FaCheckCircle, FaTimes, FaSave,
} from "react-icons/fa";

interface ManagementViewProps {
  grievances:  Grievance[];
  loading:     boolean;
  onRefresh:   () => Promise<void>;
  selectedId?: string;
}

export default function ManagementView({
  grievances, loading, onRefresh, selectedId,
}: ManagementViewProps) {
  const [selected,   setSelected]   = useState<Grievance | null>(null);
  const [updating,   setUpdating]   = useState(false);
  const [updateForm, setUpdateForm] = useState<UpdateForm>({ status: "", note: "", by: "" });
  const [updateMsg,  setUpdateMsg]  = useState<UpdateMsg | null>(null);
  const [filter,     setFilter]     = useState("সব");
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    if (!selectedId) return;
    const found = grievances.find(g => g.ID === selectedId);
    if (found) { openDetail(found); return; }
    apiGet({ action: "getOne", id: selectedId }).then(res => {
      if (res.success && res.data) openDetail(res.data as Grievance);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const openDetail = (g: Grievance) => {
    setSelected(g);
    setUpdateForm({ status: g.Status, note: "", by: "" });
    setUpdateMsg(null);
  };

  const submitUpdate = async () => {
    if (!updateForm.status || !updateForm.note) {
      setUpdateMsg({ type: "error", text: "স্ট্যাটাস এবং মন্তব্য আবশ্যক।" }); return;
    }
    setUpdating(true); setUpdateMsg(null);
    try {
      const res = await apiPost({ action: "update", id: selected!.ID, ...updateForm });
      if (res.success) {
        setUpdateMsg({ type: "success", text: "সফলভাবে আপডেট হয়েছে।" });
        await onRefresh();
        const updated = await apiGet({ action: "getOne", id: selected!.ID });
        if (updated.success) setSelected(updated.data as Grievance);
      } else {
        setUpdateMsg({ type: "error", text: res.message || "আপডেট ব্যর্থ হয়েছে।" });
      }
    } catch {
      setUpdateMsg({ type: "error", text: "নেটওয়ার্ক ত্রুটি।" });
    }
    setUpdating(false);
  };

  const ALL_FILTERS = ["সব", ...FLOW_STEPS.map(s => s.status)];
  const filtered = grievances.filter(g => {
    const mf = filter === "সব" || g.Status === filter;
    const ms = !search
      || g.ID?.includes(search)
      || g.Name?.toLowerCase().includes(search.toLowerCase())
      || g.Department?.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });
  const counts = FLOW_STEPS.reduce<Record<string, number>>((a, s) => {
    a[s.status] = grievances.filter(g => g.Status === s.status).length; return a;
  }, {});

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h2 style={{ ...S.sectionTitle, margin: 0 }}>
          <FaThLarge style={{ fontSize: 20, color: "#7F77DD" }} />
          ব্যবস্থাপনা প্যানেল
        </h2>
      </div>

      {/* Stats — clickable filter pills */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 8, marginBottom: "1.25rem" }}>
        {[
          { label: "মোট", status: "সব",  val: grievances.length, color: "#1a1a18" },
          ...FLOW_STEPS.map(s => ({ label: s.label, status: s.status, val: counts[s.status] || 0, color: s.color })),
        ].map(s => (
          <div key={s.status}
            onClick={() => setFilter(filter === s.status ? "সব" : s.status)}
            style={{
              background: filter === s.status ? s.color : "#fff",
              color:      filter === s.status ? "#fff" : s.color,
              borderRadius: 10, border: `1px solid ${s.color}`,
              padding: "10px 12px", textAlign: "center", cursor: "pointer",
              transition: "all .15s",
            }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{s.val}</div>
            <div style={{ fontSize: 10, marginTop: 2, opacity: .8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          style={{ ...S.input, flex: 1, minWidth: 160 }}
          placeholder="আইডি, নাম বা বিভাগ দিয়ে খুঁজুন…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {filter !== "সব" && (
          <button onClick={() => setFilter("সব")}
            style={{ ...S.btnSecondary, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
            <FaTimes style={{ fontSize: 11 }}/> ফিল্টার বাতিল
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#888780" }}>
          <FaSpinner style={{ fontSize: 28, animation: "spin 1s linear infinite" }} />
          <div style={{ marginTop: 8, fontSize: 13 }}>অভিযোগ লোড হচ্ছে…</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{ ...S.card, textAlign: "center", color: "#888780", padding: "2.5rem" }}>
              <FaInbox style={{ fontSize: 32 }} />
              <div style={{ marginTop: 8, fontSize: 13 }}>কোনো অভিযোগ পাওয়া যায়নি।</div>
            </div>
          )}
          {filtered.map(g => (
            <div key={g.ID}
              style={{ ...S.card, cursor: "pointer",
                borderLeft: `4px solid ${STATUS_COLORS[g.Status] || "#D3D1C7"}`,
                padding: "0.9rem 1.1rem",
                background: selected?.ID === g.ID ? (STATUS_COLORS[g.Status]||"#e2e8f0")+"0d" : "#fff",
                border: selected?.ID === g.ID ? `1.5px solid ${STATUS_COLORS[g.Status]||"#e2e8f0"}` : undefined,
              }}
              onClick={() => openDetail(g)}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a18", marginBottom: 2,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.ID}</div>
                  <div style={{ fontSize: 13, color: "#444441" }}>
                    {g.EmployeeID === "ANON" ? "বেনামী কর্মী" : g.Name}
                    {g.Department && ` · ${g.Department}`}
                  </div>
                  <div style={{ fontSize: 11, color: "#888780", marginTop: 2 }}>{g.Category}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={S.badge(g.Status)}>{g.Status}</span>
                  <span style={S.urgencyBadge(g.Urgency)}>{g.Urgency}</span>
                  <span style={{ fontSize: 10, color: "#888780" }}>
                    {g.SubmittedAt ? new Date(g.SubmittedAt).toLocaleDateString("bn-BD") : ""}
                  </span>
                </div>
              </div>
              {g.Description && (
                <div style={{ fontSize: 12, color: "#5F5E5A", marginTop: 6, lineHeight: 1.5,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {g.Description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 680,
            maxHeight: "90vh", overflowY: "auto", padding: "1.5rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div>
                <div style={{ fontSize: 11, color: "#888780", marginBottom: 2, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.05em" }}>অভিযোগের বিস্তারিত</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#0f2442" }}>{selected.ID}</div>
              </div>
              <button style={{ ...S.btnSecondary, padding: "7px 11px" }}
                onClick={() => setSelected(null)} aria-label="বন্ধ করুন">
                <FaTimes style={{ fontSize: 15 }} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1.25rem" }}>
              {[
                { label: "কর্মী",         val: selected.EmployeeID === "ANON" ? "বেনামী কর্মী" : `${selected.Name} (${selected.EmployeeID})` },
                { label: "বিভাগ",         val: selected.Department },
                { label: "অভিযোগের ধরন", val: selected.Category },
                { label: "জরুরিত্ব",      val: selected.Urgency },
              ].map(d => (
                <div key={d.label} style={{ background: "#f8fafc", borderRadius: 8, padding: "9px 11px" }}>
                  <div style={{ fontSize: 10, color: "#888780", marginBottom: 2 }}>{d.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{d.val}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
              <span style={S.urgencyBadge(selected.Urgency)}>{selected.Urgency}</span>
              <span style={S.badge(selected.Status)}>{selected.Status}</span>
              {selected.SubmittedAt && (
                <span style={{ fontSize: 11, color: "#94a3b8", alignSelf: "center" }}>
                  {new Date(selected.SubmittedAt).toLocaleDateString("bn-BD")}
                </span>
              )}
            </div>

            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "11px 13px", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: 10, color: "#888780", marginBottom: 5, fontWeight: 700,
                letterSpacing: "0.05em", textTransform: "uppercase" }}>বিবরণ</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: "#1e293b" }}>{selected.Description}</div>
            </div>

            <FlowBoard grievance={selected} />

            <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "1.25rem", paddingTop: "1.25rem" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: "0.75rem",
                textTransform: "uppercase", letterSpacing: "0.05em" }}>স্ট্যাটাস আপডেট করুন</div>

              {updateMsg && (
                <div style={updateMsg.type === "success" ? S.alertSuccess : S.alertError}>
                  {updateMsg.type === "success"
                    ? <FaCheckCircle style={{ fontSize: 15, flexShrink: 0 }} />
                    : <FaExclamationCircle style={{ fontSize: 15, flexShrink: 0 }} />}
                  <span style={{ fontSize: 13 }}>{updateMsg.text}</span>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div style={S.formGroup}>
                  <label style={S.label}>নতুন স্ট্যাটাস *</label>
                  <select style={S.select} value={updateForm.status}
                    onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}>
                    {FLOW_STEPS.map(s => <option key={s.status}>{s.status}</option>)}
                  </select>
                </div>
                <div style={S.formGroup}>
                  <label style={S.label}>আপডেটকারীর নাম</label>
                  <input style={S.input} value={updateForm.by}
                    onChange={e => setUpdateForm(f => ({ ...f, by: e.target.value }))}
                    placeholder="নাম / পদবি" />
                </div>
                <div style={{ ...S.formGroup, gridColumn: "1 / -1" }}>
                  <label style={S.label}>গৃহীত পদক্ষেপ / মন্তব্য *</label>
                  <textarea style={S.textarea} value={updateForm.note}
                    onChange={e => setUpdateForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="ব্যবস্থাপনার পক্ষ থেকে গৃহীত পদক্ষেপের বিবরণ লিখুন…" />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button style={S.btnSecondary} onClick={() => setSelected(null)}>বাতিল</button>
                <button style={S.btnPrimary} onClick={submitUpdate} disabled={updating}>
                  {updating
                    ? <><FaSpinner style={{ fontSize: 13, animation: "spin 1s linear infinite" }} /> সংরক্ষণ হচ্ছে…</>
                    : <><FaSave style={{ fontSize: 13 }} /> সংরক্ষণ করুন</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}