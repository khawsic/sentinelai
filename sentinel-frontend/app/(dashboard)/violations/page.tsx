"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink, CheckCircle, Info, X } from "lucide-react";
import { violations as violationsAPI } from "@/lib/api";

export default function ViolationsPage() {
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [explainModal, setExplainModal] = useState<any>(null);

  useEffect(() => {
    violationsAPI.list().then(r => setViolations(r.data.violations || [])).finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id: string) => {
    await violationsAPI.resolve(id);
    setViolations(p => p.map(v => v.id === id ? { ...v, status: "resolved" } : v));
  };

  const filtered = violations.filter(v => {
    if (filter === "all") return true;
    if (filter === "active") return v.status !== "resolved";
    if (filter === "resolved") return v.status === "resolved";
    if (filter === "repeat") return v.repeat_offender === "true" || v.repeat_offender === true;
    return v.severity === filter;
  });

  const severityColor = (s: string) => s === "critical" ? "#ef4444" : s === "high" ? "#f59e0b" : s === "medium" ? "#3b82f6" : "#10b981";

  return (
    <div style={{ padding: "36px 36px 80px" }}>

      {/* Explain modal */}
      {explainModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#0d1425", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 20, padding: "32px", maxWidth: 560, width: "100%", position: "relative" }}>
            <button onClick={() => setExplainModal(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
              <X size={18} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Info size={20} color="#00e5ff" />
              <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>AI Decision Explanation</span>
            </div>
            <div style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#00e5ff", fontWeight: 700, marginBottom: 8, letterSpacing: "0.06em" }}>PLAIN ENGLISH REASON</div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{explainModal.explanation || "Content matched registered asset fingerprint within the detection threshold."}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>RISK SCORE</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: severityColor(explainModal.severity) }}>{explainModal.risk_score}/100</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>SIMILARITY</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{explainModal.similarity}%</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>REPEAT OFFENDER</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: explainModal.repeat_offender === "true" || explainModal.repeat_offender === true ? "#ef4444" : "#10b981" }}>
                  {explainModal.repeat_offender === "true" || explainModal.repeat_offender === true ? "YES — flagged" : "No"}
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>REACH IMPACT</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>{explainModal.views_impact || "medium"}</div>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "14px" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>FULL AI REPORT</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{explainModal.ai_report}</p>
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(0,229,255,0.08)", color: "#00e5ff", border: "1px solid rgba(0,229,255,0.15)" }}>
                Recommended: {explainModal.recommended}
              </span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Violations</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>{violations.length} total detections across all platforms</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { key: "all", label: "All" },
          { key: "active", label: "Active" },
          { key: "critical", label: "Critical" },
          { key: "high", label: "High" },
          { key: "medium", label: "Medium" },
          { key: "repeat", label: "Repeat offenders" },
          { key: "resolved", label: "Resolved" },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, border: filter === f.key ? "1px solid #00e5ff" : "1px solid rgba(255,255,255,0.08)", background: filter === f.key ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.02)", color: filter === f.key ? "#00e5ff" : "rgba(255,255,255,0.4)", cursor: "pointer", fontWeight: filter === f.key ? 700 : 400 }}>
            {f.label}
          </button>
        ))}
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", padding: "7px 0", marginLeft: 4 }}>{filtered.length} shown</span>
      </div>

      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.3)" }}>Loading violations...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 20px", background: "rgba(255,255,255,0.01)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
          <AlertTriangle size={36} color="rgba(255,255,255,0.08)" style={{ margin: "0 auto 12px", display: "block" }} />
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>No violations match this filter. Upload assets and run a scan to detect violations.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(v => (
            <div key={v.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: `3px solid ${severityColor(v.severity)}`, borderRadius: 14, padding: "20px 22px", opacity: v.status === "resolved" ? 0.55 : 1, transition: "opacity 0.3s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: severityColor(v.severity), background: `${severityColor(v.severity)}15`, padding: "3px 10px", borderRadius: 20 }}>{v.severity?.toUpperCase()}</span>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{v.asset_name}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", padding: "2px 10px", borderRadius: 20 }}>{v.platform}</span>
                    {(v.repeat_offender === "true" || v.repeat_offender === true) && (
                      <span style={{ fontSize: 10, color: "#ef4444", background: "rgba(239,68,68,0.08)", padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(239,68,68,0.2)", fontWeight: 700 }}>REPEAT OFFENDER</span>
                    )}
                    {v.status === "resolved" && <span style={{ fontSize: 10, color: "#10b981", background: "rgba(16,185,129,0.08)", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(16,185,129,0.2)" }}>RESOLVED</span>}
                  </div>
                  {v.video_title && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>"{v.video_title}" by {v.channel_name}</p>}
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, marginBottom: 12 }}>{v.ai_report}</p>
                  <div style={{ display: "flex", gap: 20, fontSize: 11, color: "rgba(255,255,255,0.2)", flexWrap: "wrap" }}>
                    <span>Similarity: <span style={{ color: "rgba(255,255,255,0.5)" }}>{v.similarity}%</span></span>
                    <span>Risk: <span style={{ color: severityColor(v.severity) }}>{v.risk_score}/100</span></span>
                    <span>Action: <span style={{ color: "rgba(255,255,255,0.4)" }}>{v.recommended}</span></span>
                    <span>Reach: <span style={{ color: "#f59e0b" }}>{v.views_impact || "medium"}</span></span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, flexShrink: 0 }}>
                  <button onClick={() => setExplainModal(v)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "8px 14px", borderRadius: 8, background: "rgba(139,92,246,0.08)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)", cursor: "pointer", fontWeight: 600 }}>
                    <Info size={11} /> Explain AI
                  </button>
                  <a href={v.infringing_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "8px 14px", borderRadius: 8, background: "rgba(0,229,255,0.06)", color: "#00e5ff", border: "1px solid rgba(0,229,255,0.15)", textDecoration: "none" }}>
                    <ExternalLink size={11} /> View
                  </a>
                  {v.status !== "resolved" && (
                    <button onClick={() => handleResolve(v.id)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "8px 14px", borderRadius: 8, background: "rgba(16,185,129,0.06)", color: "#10b981", border: "1px solid rgba(16,185,129,0.15)", cursor: "pointer" }}>
                      <CheckCircle size={11} /> Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}