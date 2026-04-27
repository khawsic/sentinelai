"use client";
import { useState } from "react";
import { Scan, Zap, Shield, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { dashboard } from "@/lib/api";

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [phase, setPhase] = useState("");
  const [done, setDone] = useState(false);

  const phases = [
    "Connecting to YouTube Data API...",
    "Searching for matching content...",
    "Downloading thumbnails for analysis...",
    "Running perceptual hash comparison...",
    "Sending matches to Gemini AI...",
    "Generating violation reports...",
    "Writing results to Firestore...",
    "Scan complete.",
  ];

  const runScan = async () => {
    setScanning(true);
    setResult(null);
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      setPhase(phases[i]);
      i++;
      if (i >= phases.length - 1) clearInterval(interval);
    }, 1200);
    try {
      const res = await dashboard.scan();
      clearInterval(interval);
      setPhase(phases[phases.length - 1]);
      setResult(res.data);
      setDone(true);
    } catch (e: any) {
      clearInterval(interval);
      setPhase("Scan failed. Check your API keys and try again.");
      setDone(true);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ padding: "36px 36px 80px" }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 500, marginBottom: 6 }}>AI scan engine</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Crawl platforms and detect violations using Gemini AI</p>
      </div>

      {/* Scan card */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 20, padding: "48px 40px", textAlign: "center", marginBottom: 32, maxWidth: 600, margin: "0 auto 32px" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: scanning ? "rgba(0,229,255,0.1)" : "rgba(0,229,255,0.06)", border: `2px solid ${scanning ? "#00e5ff" : "rgba(0,229,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", transition: "all 0.3s" }}>
          <Scan size={32} color="#00e5ff" style={{ animation: scanning ? "spin 2s linear infinite" : "none" }} />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 10 }}>
          {done ? "Scan complete" : scanning ? "Scanning in progress..." : "Ready to scan"}
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 32, lineHeight: 1.6 }}>
          {scanning || done ? phase : "Click to start a full AI-powered scan across YouTube. Results will appear in your violations feed instantly."}
        </p>

        {/* Phase indicator */}
        {(scanning || done) && (
          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "14px 18px", marginBottom: 28, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {scanning ? <RefreshCw size={12} color="#00e5ff" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} /> : <CheckCircle size={12} color="#10b981" style={{ flexShrink: 0 }} />}
              <span style={{ fontSize: 12, color: scanning ? "#00e5ff" : "#10b981", fontFamily: "monospace" }}>{phase}</span>
            </div>
          </div>
        )}

        <button onClick={runScan} disabled={scanning} style={{ display: "inline-flex", alignItems: "center", gap: 10, background: scanning ? "rgba(0,229,255,0.3)" : "#00e5ff", color: "#0a0f1e", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 500, cursor: scanning ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
          <Zap size={16} />
          {scanning ? "Scanning..." : done ? "Scan again" : "Start AI scan"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Assets scanned", val: result.assets_scanned || 0, color: "#00e5ff", icon: <Shield size={16} /> },
              { label: "Violations found", val: result.violations_found || 0, color: result.violations_found > 0 ? "#ef4444" : "#10b981", icon: <AlertTriangle size={16} /> },
              { label: "Status", val: "Complete", color: "#10b981", icon: <CheckCircle size={16} /> },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "18px 16px", textAlign: "center" }}>
                <div style={{ color: s.color, display: "flex", justifyContent: "center", marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 500, color: s.color, marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {result.violations && result.violations.length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 14, color: "rgba(255,255,255,0.6)" }}>New violations detected</h3>
              {result.violations.map((v: any, i: number) => (
                <div key={i} style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 10, padding: "14px 16px", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className={`severity-${v.severity}`} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 500, flexShrink: 0 }}>{v.severity?.toUpperCase()}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{v.asset_name}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{v.platform}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6, lineHeight: 1.6 }}>{v.ai_report?.slice(0, 120)}...</p>
                </div>
              ))}
            </div>
          )}

          {result.violations_found === 0 && (
            <div style={{ textAlign: "center", padding: "32px", background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)", borderRadius: 14 }}>
              <CheckCircle size={28} color="#10b981" style={{ margin: "0 auto 10px", display: "block" }} />
              <p style={{ color: "#10b981", fontSize: 14 }}>No violations detected. Your assets are clean.</p>
            </div>
          )}
        </div>
      )}

      {/* Info cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginTop: 48, maxWidth: 800, margin: "48px auto 0" }}>
        {[
          { title: "YouTube crawl", desc: "Searches YouTube Data API for matching titles and downloads thumbnails for comparison." },
          { title: "Perceptual hashing", desc: "pHash fingerprints compared using Hamming distance. Matches under distance 12 flagged." },
          { title: "Gemini AI analysis", desc: "Every match analyzed by Gemini 2.0 Flash — risk scored, report written, action recommended." },
          { title: "Auto storage", desc: "All violations saved to Firestore instantly. Available in dashboard and violations feed." },
        ].map((c, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "18px 16px" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#00e5ff", marginBottom: 8 }}>{c.title}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}