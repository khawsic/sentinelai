"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { auth } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await auth.login(email, password);
      saveAuth(res.data.token, { email: res.data.email, user_id: res.data.user_id });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "15px 16px 15px 48px",
    color: "#fff",
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050810", display: "flex" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(0,229,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.025) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
      <div style={{ position: "fixed", top: "30%", left: "20%", width: 500, height: 500, background: "radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

      {/* Left — form */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 100px", position: "relative", zIndex: 1 }}>

        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 14, textDecoration: "none", marginBottom: 64 }}>
          <img src="/logo.webp" alt="SentinelAI" style={{ height: 64, width: 64, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>Sentinel<span style={{ color: "#00e5ff" }}>AI</span></div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3, letterSpacing: "0.04em" }}>Sports Media Protection</div>
          </div>
        </Link>

        <div style={{ maxWidth: 500 }}>
          <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 10, lineHeight: 1.1 }}>Welcome back</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", marginBottom: 40, lineHeight: 1.6 }}>Sign in to access your real-time sports media protection dashboard.</p>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 28 }}>
              <AlertCircle size={18} color="#ef4444" />
              <span style={{ fontSize: 14, color: "#ef4444" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 9, fontWeight: 700, letterSpacing: "0.07em" }}>EMAIL ADDRESS</label>
              <div style={{ position: "relative" }}>
                <Mail size={17} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@organization.com" style={inputStyle}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "rgba(0,229,255,0.5)"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)"} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 9, fontWeight: 700, letterSpacing: "0.07em" }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <Lock size={17} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password"
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "rgba(0,229,255,0.5)"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)"} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 0 }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "rgba(0,229,255,0.5)" : "#00e5ff", color: "#050810", border: "none", borderRadius: 12, padding: "16px", fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
              {loading ? "Signing in..." : "Sign in to SentinelAI"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
            No account?{" "}
            <Link href="/register" style={{ color: "#00e5ff", textDecoration: "none", fontWeight: 700 }}>Create one free</Link>
          </p>
        </div>
      </div>

      {/* Right — features */}
      <div style={{ width: 500, background: "rgba(0,229,255,0.025)", borderLeft: "1px solid rgba(0,229,255,0.08)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 52px", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 11, color: "#00e5ff", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 36 }}>WHAT YOU GET</div>
        {[
          { title: "Real-time detection", desc: "AI scans 60+ platforms continuously for unauthorized use of your media assets." },
          { title: "Gemini AI reports", desc: "Every violation analyzed with a full natural language explanation and 0-100 risk score." },
          { title: "One-click enforcement", desc: "DMCA notices filed automatically. Violations resolved in minutes, not days." },
          { title: "Live threat dashboard", desc: "See every violation as it happens — severity, platform, channel, similarity score." },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00e5ff", flexShrink: 0, marginTop: 6 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5, color: "#fff" }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 24, padding: "20px", background: "rgba(0,229,255,0.04)", borderRadius: 14, border: "1px solid rgba(0,229,255,0.1)" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginBottom: 12, fontWeight: 700, letterSpacing: "0.06em" }}>SECURED BY</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Firebase Auth","JWT Tokens","SHA-256 Hashing","TLS Encryption"].map(t => (
              <span key={t} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 20, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}