"use client";
import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Shield, TrendingUp, Clock, RefreshCw, Zap, ExternalLink, CheckCircle, Activity, BarChart2, Globe } from "lucide-react";
import { dashboard, violations as violationsAPI } from "@/lib/api";

function PulseRing({ color }: { color: string }) {
  return (
    <div style={{ position: "relative", width: 10, height: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", background: color, opacity: 0.3, animation: "pulse-dot 2s infinite" }} />
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, position: "relative", zIndex: 1 }} />
    </div>
  );
}

function StatCard({ label, value, icon, color, change }: any) {
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.08em" }}>{label.toUpperCase()}</span>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: color }}>{icon}</div>
      </div>
      <div style={{ fontSize: 40, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
      {change && <div style={{ fontSize: 11, color: color, marginTop: 8, fontWeight: 600 }}>{change}</div>}
    </div>
  );
}

function SeverityBar({ critical, high, medium, total }: any) {
  if (total === 0) return null;
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Threat distribution</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>{total} total</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, overflow: "hidden", display: "flex", gap: 2, marginBottom: 12 }}>
        {critical > 0 && <div style={{ flex: critical, background: "#ef4444", borderRadius: 4 }} />}
        {high > 0 && <div style={{ flex: high, background: "#f59e0b", borderRadius: 4 }} />}
        {medium > 0 && <div style={{ flex: medium, background: "#3b82f6", borderRadius: 4 }} />}
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        {[{ label: "Critical", val: critical, color: "#ef4444" }, { label: "High", val: high, color: "#f59e0b" }, { label: "Medium", val: medium, color: "#3b82f6" }].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.label}: <span style={{ color: s.color, fontWeight: 700 }}>{s.val}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [s, v] = await Promise.all([dashboard.stats(), violationsAPI.list()]);
      setStats(s.data);
      setViolations(v.data.violations || []);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleScan = async () => {
    setScanning(true);
    setScanMsg("AI scanning platforms...");
    try {
      const res = await dashboard.scan();
      setScanMsg(`Found ${res.data.violations_found} violations`);
      await loadData();
    } catch { setScanMsg("Scan failed"); }
    finally { setScanning(false); setTimeout(() => setScanMsg(""), 5000); }
  };

  const handleResolve = async (id: string) => {
    await violationsAPI.resolve(id);
    setViolations(p => p.map(v => v.id === id ? { ...v, status: "resolved" } : v));
    setStats((s: any) => s ? { ...s, active: Math.max(0, s.active - 1), resolved: s.resolved + 1 } : s);
  };

  const severityColor = (s: string) => s === "critical" ? "#ef4444" : s === "high" ? "#f59e0b" : s === "medium" ? "#3b82f6" : "#10b981";

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16 }}>
      <img src="/logo.webp" alt="" style={{ height: 48, width: 48, objectFit: "contain", opacity: 0.6 }} />
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Loading intelligence data...</p>
    </div>
  );

  const activeViolations = violations.filter(v => v.status !== "resolved");
  const resolvedViolations = violations.filter(v => v.status === "resolved");

  return (
    <div style={{ padding: "32px 36px 80px", maxWidth: 1400 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>Command center</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "rgba(16,185,129,0.08)", borderRadius: 20, border: "1px solid rgba(16,185,129,0.15)" }}>
              <PulseRing color="#10b981" />
              <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700, letterSpacing: "0.06em" }}>LIVE</span>
            </div>
          </div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
            Real-time AI threat intelligence
            {lastUpdated && <span style={{ marginLeft: 12, fontSize: 12 }}>· Updated {lastUpdated.toLocaleTimeString()}</span>}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {scanMsg && (
            <div style={{ fontSize: 12, color: "#00e5ff", padding: "8px 16px", background: "rgba(0,229,255,0.06)", borderRadius: 10, border: "1px solid rgba(0,229,255,0.12)" }}>
              {scanMsg}
            </div>
          )}
          <button onClick={loadData} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={handleScan} disabled={scanning} style={{ display: "flex", alignItems: "center", gap: 8, background: scanning ? "rgba(0,229,255,0.3)" : "#00e5ff", color: "#050810", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 800, cursor: scanning ? "not-allowed" : "pointer", letterSpacing: "-0.01em" }}>
            {scanning ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={14} />}
            {scanning ? "Scanning..." : "Run AI scan"}
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Assets protected" value={stats?.total_assets || 0} icon={<Shield size={16} />} color="#00e5ff" change={stats?.total_assets > 0 ? `${stats.total_assets} media fingerprints active` : "Upload assets to begin"} />
        <StatCard label="Active violations" value={stats?.active || 0} icon={<AlertTriangle size={16} />} color="#ef4444" change={stats?.active > 0 ? "Requires attention" : "All clear"} />
        <StatCard label="Critical threats" value={stats?.critical || 0} icon={<TrendingUp size={16} />} color="#ef4444" change="Immediate action needed" />
        <StatCard label="Resolved" value={stats?.resolved || 0} icon={<Clock size={16} />} color="#10b981" change={stats?.resolved > 0 ? "Successfully closed" : "No resolved cases yet"} />
      </div>

      {/* Threat distribution bar */}
      <SeverityBar critical={stats?.critical || 0} high={stats?.high || 0} medium={stats?.medium || 0} total={stats?.total_violations || 0} />

      {/* Platform breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { platform: "YouTube", count: violations.filter(v => v.platform === "YouTube").length, color: "#ef4444" },
          { platform: "Telegram", count: violations.filter(v => v.platform === "Telegram").length, color: "#3b82f6" },
          { platform: "Other platforms", count: violations.filter(v => !["YouTube","Telegram"].includes(v.platform)).length, color: "#8b5cf6" },
        ].map(p => (
          <div key={p.platform} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Globe size={14} color={p.color} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{p.platform}</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: p.color }}>{p.count}</span>
          </div>
        ))}
      </div>

      {/* Violations feed */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>Live violations feed</h2>
          {activeViolations.length > 0 && (
            <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", fontWeight: 700 }}>{activeViolations.length} active</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PulseRing color="#ef4444" />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>LIVE</span>
        </div>
      </div>

      {violations.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "rgba(255,255,255,0.01)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
          <Shield size={40} color="rgba(255,255,255,0.06)" style={{ margin: "0 auto 16px", display: "block" }} />
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 15, marginBottom: 8 }}>No violations detected yet</p>
          <p style={{ color: "rgba(255,255,255,0.12)", fontSize: 13 }}>Upload assets in the Assets page, then run an AI scan</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {violations.map(v => (
            <div key={v.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: `3px solid ${severityColor(v.severity)}`, borderRadius: 14, padding: "18px 22px", opacity: v.status === "resolved" ? 0.45 : 1, transition: "all 0.3s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: severityColor(v.severity), background: `${severityColor(v.severity)}15`, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.04em" }}>{v.severity?.toUpperCase()}</span>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{v.asset_name}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 20 }}>{v.platform}</span>
                    {v.status === "resolved" && <span style={{ fontSize: 10, color: "#10b981", background: "rgba(16,185,129,0.08)", padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(16,185,129,0.2)", fontWeight: 700 }}>RESOLVED</span>}
                  </div>
                  {v.video_title && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontStyle: "italic" }}>"{v.video_title}" — {v.channel_name}</p>}
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, marginBottom: 10 }}>{v.ai_report}</p>
                  <div style={{ display: "flex", gap: 16, fontSize: 11, color: "rgba(255,255,255,0.2)", flexWrap: "wrap" }}>
                    <span>Match: <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>{v.similarity}%</span></span>
                    <span>Risk: <span style={{ color: severityColor(v.severity), fontWeight: 700 }}>{v.risk_score}/100</span></span>
                    <span>Action: <span style={{ color: "rgba(255,255,255,0.4)" }}>{v.recommended}</span></span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  <a href={v.infringing_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "8px 14px", borderRadius: 8, background: "rgba(0,229,255,0.06)", color: "#00e5ff", border: "1px solid rgba(0,229,255,0.12)", textDecoration: "none", fontWeight: 600 }}>
                    <ExternalLink size={11} /> View
                  </a>
                  {v.status !== "resolved" && (
                    <button onClick={() => handleResolve(v.id)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "8px 14px", borderRadius: 8, background: "rgba(16,185,129,0.06)", color: "#10b981", border: "1px solid rgba(16,185,129,0.12)", cursor: "pointer", fontWeight: 600 }}>
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