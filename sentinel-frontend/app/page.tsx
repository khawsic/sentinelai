"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Eye, Zap, Globe, CheckCircle, AlertTriangle, Activity } from "lucide-react";

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let n = 0;
    const step = target / 80;
    const t = setInterval(() => {
      n += step;
      if (n >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(n));
    }, 20);
    return () => clearInterval(t);
  }, [target]);
  return <>{count.toLocaleString()}</>;
}

const liveViolations = [
  { platform: "YouTube", asset: "IPL Final 2024 — Full Match", severity: "critical", channel: "CricketLeaksHD", time: "2m ago", similarity: "94.5%" },
  { platform: "Telegram", asset: "Champions League Final", severity: "critical", channel: "FootballFreeStream", time: "7m ago", similarity: "91.2%" },
  { platform: "TikTok", asset: "FIFA WC 2026 Promo", severity: "high", channel: "@sportvids_free", time: "12m ago", similarity: "82.7%" },
  { platform: "Instagram", asset: "Wimbledon Final Highlights", severity: "high", channel: "@tennisleaks", time: "19m ago", similarity: "78.3%" },
  { platform: "YouTube", asset: "NBA Finals Game 7", severity: "medium", channel: "BasketballUncut", time: "31m ago", similarity: "67.1%" },
];

export default function LandingPage() {
  const [visibleViolations, setVisibleViolations] = useState(liveViolations.slice(0, 4));
  const [scanProgress, setScanProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const severityColor = (s: string) => s === "critical" ? "#ef4444" : s === "high" ? "#f59e0b" : "#3b82f6";

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setScanProgress(p => p >= 100 ? 0 : p + 1), 80);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setVisibleViolations(prev => {
        const newItem = liveViolations[Math.floor(Math.random() * liveViolations.length)];
        return [newItem, ...prev.slice(0, 3)];
      });
    }, 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#050810", color: "#fff", overflowX: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,229,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.025) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", borderRadius: "50%" }} />
      </div>

      {/* Navbar — bigger logo */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(5,8,16,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,229,255,0.08)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src="/logo.webp" alt="SentinelAI" style={{ height: 48, width: 48, objectFit: "contain" }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>Sentinel<span style={{ color: "#00e5ff" }}>AI</span></div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2, letterSpacing: "0.04em" }}>Sports Media Protection</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", background: "rgba(16,185,129,0.08)", borderRadius: 20, border: "1px solid rgba(16,185,129,0.2)", marginRight: 8 }}>
              <div className="animate-pulse-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
              <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700, letterSpacing: "0.04em" }}>LIVE MONITORING</span>
            </div>
            <Link href="/login" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", padding: "9px 18px", borderRadius: 9, textDecoration: "none" }}>Sign in</Link>
            <Link href="/register" style={{ fontSize: 14, color: "#050810", background: "#00e5ff", padding: "10px 22px", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "168px 32px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 24, padding: "6px 14px 6px 8px", marginBottom: 32 }}>
            <span style={{ fontSize: 10, background: "#00e5ff", color: "#050810", padding: "3px 8px", borderRadius: 12, fontWeight: 700 }}>NEW</span>
            <span style={{ fontSize: 12, color: "rgba(0,229,255,0.8)" }}>Google Solution Challenge 2025</span>
          </div>
          <h1 style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05, marginBottom: 24, letterSpacing: "-0.04em" }}>
            Stop Sports<br />Media Piracy<br /><span style={{ color: "#00e5ff" }}>With AI.</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, marginBottom: 40, maxWidth: 480 }}>
            SentinelAI detects unauthorized redistribution of official sports media across YouTube, Telegram, TikTok and 60+ platforms in near real-time using Gemini AI and perceptual fingerprinting.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#00e5ff", color: "#050810", padding: "15px 30px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
              Start protecting <ArrowRight size={16} />
            </Link>
            <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", color: "#fff", padding: "15px 30px", borderRadius: 12, textDecoration: "none", fontSize: 15, border: "1px solid rgba(255,255,255,0.08)" }}>
              Sign in to dashboard
            </Link>
          </div>
          <div style={{ display: "flex", gap: 40 }}>
            {[
              { val: mounted ? <AnimatedCounter target={2847} /> : "0", label: "Violations detected" },
              { val: "94%", label: "Takedown success" },
              { val: "<5min", label: "Response time" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#00e5ff", letterSpacing: "-0.02em" }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="animate-pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)" }}>LIVE THREAT FEED</span>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {["#ef4444","#f59e0b","#10b981"].map((c,i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.6 }} />)}
              </div>
            </div>
            <div style={{ padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
              <Activity size={12} color="#00e5ff" />
              <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${scanProgress}%`, height: "100%", background: "linear-gradient(90deg,#00e5ff,#8b5cf6)", borderRadius: 2, transition: "width 0.08s linear" }} />
              </div>
              <span style={{ fontSize: 10, color: "#00e5ff", fontFamily: "monospace", fontWeight: 700 }}>SCANNING</span>
            </div>
            {visibleViolations.map((v, i) => (
              <div key={`${v.asset}-${i}`} style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 3, height: 40, borderRadius: 2, background: severityColor(v.severity), flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.asset}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{v.platform} · {v.channel} · {v.similarity} match</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: severityColor(v.severity), background: `${severityColor(v.severity)}18`, padding: "3px 8px", borderRadius: 10, marginBottom: 3 }}>{v.severity.toUpperCase()}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{v.time}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: "14px 20px" }}>
              <Link href="/register" style={{ fontSize: 12, color: "#00e5ff", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                View all violations <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem banner */}
      <section style={{ position: "relative", zIndex: 1, background: "rgba(239,68,68,0.04)", borderTop: "1px solid rgba(239,68,68,0.1)", borderBottom: "1px solid rgba(239,68,68,0.1)", padding: "36px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 20 }}>
          <AlertTriangle size={32} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", marginBottom: 8, letterSpacing: "0.06em" }}>THE PROBLEM — GOOGLE SOLUTION CHALLENGE 2025</div>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 900 }}>
              Sports organizations generate massive volumes of high-value digital media that rapidly scatter across global platforms. This visibility gap leaves proprietary content highly vulnerable to widespread misappropriation — costing the industry <span style={{ color: "#ef4444", fontWeight: 700 }}>billions annually</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section style={{ position: "relative", zIndex: 1, padding: "96px 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 11, color: "#00e5ff", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>THE DETECTION PIPELINE</div>
          <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>Five layers of AI protection</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", maxWidth: 500, margin: "0 auto" }}>Every piece of sports media protected end-to-end</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden" }}>
          {[
            { num: "01", icon: <Shield size={24} />, title: "Register", desc: "Upload media. pHash fingerprint generated instantly.", color: "#00e5ff" },
            { num: "02", icon: <Globe size={24} />, title: "Crawl", desc: "YouTube, Telegram, TikTok scanned 24/7.", color: "#8b5cf6" },
            { num: "03", icon: <Eye size={24} />, title: "Match", desc: "Hamming distance comparison against registry.", color: "#ec4899" },
            { num: "04", icon: <Zap size={24} />, title: "Analyze", desc: "Gemini AI assigns risk score and writes report.", color: "#f59e0b" },
            { num: "05", icon: <CheckCircle size={24} />, title: "Enforce", desc: "DMCA filed. Rights holder alerted instantly.", color: "#10b981" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "40px 24px", background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent", borderRight: i < 4 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", fontWeight: 700, marginBottom: 20, letterSpacing: "0.08em" }}>{s.num}</div>
              <div style={{ color: s.color, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AI features */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 32px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>GEMINI AI CAPABILITIES</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em" }}>AI that thinks like a rights lawyer</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { title: "Risk scoring engine", desc: "0-100 risk score based on similarity, channel reach, view count, and territory rights.", color: "#ef4444" },
              { title: "Repeat offender detection", desc: "Tracks infringer patterns. Channels that repeatedly violate are escalated automatically.", color: "#f59e0b" },
              { title: "Explain AI decision", desc: "Every violation has a full Gemini-written explanation — why flagged and what action to take.", color: "#00e5ff" },
              { title: "View count intelligence", desc: "Violations on 1M+ view videos auto-escalate to critical regardless of similarity score.", color: "#8b5cf6" },
              { title: "Territory-aware scoring", desc: "Content in unlicensed regions scores higher. Licensed territory content scored proportionally.", color: "#10b981" },
              { title: "Fair use filtering", desc: "Gemini identifies likely fair use cases and marks them medium/low — reducing false positives.", color: "#ec4899" },
            ].map((f, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "28px 24px", borderTop: `3px solid ${f.color}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — big logo */}
      <section style={{ position: "relative", zIndex: 1, padding: "100px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <img src="/logo.webp" alt="SentinelAI" style={{ height: 96, width: 96, objectFit: "contain", margin: "0 auto 32px", display: "block" }} />
          <h2 style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>Ready to protect your media?</h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.35)", marginBottom: 40, lineHeight: 1.7 }}>Join sports organizations using SentinelAI to detect and stop piracy at scale — automatically.</p>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#00e5ff", color: "#050810", padding: "17px 44px", borderRadius: 14, textDecoration: "none", fontWeight: 700, fontSize: 16 }}>
            Create free account <ArrowRight size={18} />
          </Link>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 40 }}>
            {["SDG 16 — Justice & Institutions","Google Solution Challenge 2025","Powered by Gemini AI"].map(t => (
              <span key={t} style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer — logo prominent */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "36px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/logo.webp" alt="" style={{ height: 40, width: 40, objectFit: "contain" }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Sentinel<span style={{ color: "#00e5ff" }}>AI</span></div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 1 }}>Sports Media Protection Platform</div>
            </div>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>Built for Google Solution Challenge 2025 · Go · Next.js · Firebase · Gemini AI · YouTube Data API</p>
        </div>
      </footer>
    </div>
  );
}