import { useState, useImperativeHandle, forwardRef } from "react";
import type { SubmitForm } from "../shared/types";
import { DEPARTMENTS, CATEGORIES, URGENCY_LEVELS } from "../shared/constants";
import { apiPost } from "../shared/api";
import { S } from "../shared/styles";
import {
  FaFileMedical,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaPaperPlane,
  FaShieldAlt,
} from "react-icons/fa";

// Expose submit() and reset() to parent via ref
export interface SubmitViewRef {
  submit: () => Promise<void>;
  reset:  () => void;
}

interface Props {
  onSuccess?: (id: string) => void; // called after successful submit so parent can refresh records
}

const SubmitView = forwardRef<SubmitViewRef, Props>(function SubmitView({ onSuccess }, ref) {
  const [form, setForm] = useState<SubmitForm>({
    name: "",
    employeeId: "",
    department: "",
    category: "",
    description: "",
    urgency: "মাঝারি",
    anonymous: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const set = (k: keyof SubmitForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const reset = () => {
    setForm({ name: "", employeeId: "", department: "", category: "", description: "", urgency: "মাঝারি", anonymous: false });
    setSuccess(null);
    setError(null);
  };

  const submit = async (): Promise<void> => {
    if (
      (!form.anonymous && (!form.name || !form.employeeId)) ||
      !form.department ||
      !form.category ||
      !form.description
    ) {
      setError("অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost({
        action: "submit",
        ...form,
        name:       form.anonymous ? "বেনামী" : form.name,
        employeeId: form.anonymous ? "ANON"   : form.employeeId,
      });
      if (res.success) {
        setSuccess(res.id ?? null);
        setForm({ name: "", employeeId: "", department: "", category: "", description: "", urgency: "মাঝারি", anonymous: false });
        if (res.id) onSuccess?.(res.id);
      } else {
        setError(res.message || "দাখিল ব্যর্থ হয়েছে।");
      }
    } catch {
      setError("নেটওয়ার্ক ত্রুটি। Apps Script URL যাচাই করুন।");
    }
    setLoading(false);
  };

  // Expose submit + reset to GrievanceModule via ref
  useImperativeHandle(ref, () => ({ submit, reset }));

  return (
    <div>
      <h2 style={S.sectionTitle}>
        <FaFileMedical style={{ fontSize: 22, color: "#1D9E75" }} />
        অভিযোগ দাখিল করুন
      </h2>

      {success && (
        <div style={S.alertSuccess}>
          <FaCheckCircle style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>অভিযোগ সফলভাবে দাখিল হয়েছে!</div>
            <div style={{ fontSize: 13 }}>
              আপনার অভিযোগ আইডি: <strong>{success}</strong><br />
              এই আইডিটি সংরক্ষণ করুন — এটি দিয়ে অগ্রগতি ট্র্যাক করতে পারবেন।
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={S.alertError}>
          <FaExclamationCircle style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }} />
          <div>{error}</div>
        </div>
      )}

      <div style={S.card}>
        <div style={{ display: "grid", gap: "1rem" }}>
          {/* Anonymous toggle */}
          <div style={{ ...S.formGroup, marginBottom: "0.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))}
              />
              <span style={{ fontSize: 14, fontWeight: 600 }}>বেনামে অভিযোগ দাখিল করুন</span>
            </label>
          </div>

          {!form.anonymous && (
            <>
              <div style={S.formGroup}>
                <label style={S.label}>পূর্ণ নাম *</label>
                <input style={S.input} value={form.name} onChange={set("name")} placeholder="যেমন: রাইহান ইসলাম" />
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>কর্মী আইডি *</label>
                <input style={S.input} value={form.employeeId} onChange={set("employeeId")} placeholder="যেমন: EMP-0042" />
              </div>
            </>
          )}

          <div style={S.formGroup}>
            <label style={S.label}>বিভাগ *</label>
            <select style={S.select} value={form.department} onChange={set("department")}>
              <option value="">বিভাগ নির্বাচন করুন</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div style={S.formGroup}>
            <label style={S.label}>অভিযোগের ধরন *</label>
            <select style={S.select} value={form.category} onChange={set("category")}>
              <option value="">ধরন নির্বাচন করুন</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={S.formGroup}>
            <label style={S.label}>জরুরিত্বের মাত্রা</label>
            <select style={S.select} value={form.urgency} onChange={set("urgency")}>
              {URGENCY_LEVELS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>

          <div style={S.formGroup}>
            <label style={S.label}>বিবরণ *</label>
            <textarea
              style={S.textarea}
              value={form.description}
              onChange={set("description")}
              placeholder="আপনার অভিযোগের বিস্তারিত বিবরণ লিখুন। তারিখ, সংশ্লিষ্ট ব্যক্তি এবং প্রমাণ থাকলে উল্লেখ করুন..."
            />
          </div>
        </div>

        {/* Keep the internal button for mobile / non-ModuleShell use */}
        <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end" }}>
          <button style={S.btnPrimary} onClick={submit} disabled={loading}>
            {loading
              ? <><FaSpinner style={{ fontSize: 16, animation: "spin 1s linear infinite" }} /> দাখিল হচ্ছে…</>
              : <><FaPaperPlane style={{ fontSize: 16 }} /> অভিযোগ দাখিল করুন</>}
          </button>
        </div>
      </div>

      <div style={{ ...S.card, background: "#F7F6F2", border: "0.5px solid #D3D1C7" }}>
        <div style={{ fontSize: 13, color: "#5F5E5A", display: "flex", gap: 10 }}>
          <FaShieldAlt style={{ fontSize: 18, color: "#888780", flexShrink: 0, marginTop: 1 }} />
          <span>আপনার অভিযোগ সম্পূর্ণ গোপনীয়। শুধুমাত্র মানব সম্পদ বিভাগ এবং সংশ্লিষ্ট ব্যবস্থাপনা এটি দেখতে পাবেন।</span>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
});

export default SubmitView;