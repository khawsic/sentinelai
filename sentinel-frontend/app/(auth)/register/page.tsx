"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Shield, Zap, Globe } from "lucide-react";
import { auth } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await auth.register(email, password, name);
      saveAuth(res.data.token, { email: res.data.email, user_id: res.data.user_id, name: res.data.name });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
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

        {/* Big logo at top */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 14, textDecoration: "none", marginBottom: 56 }}>
          <img src="/logo.webp" alt="SentinelAI" style={{ height: 64, width: 64, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>Sentinel<span style={{ color: "#00e5ff" }}>AI</span></div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3, letterSpacing: "0.04em" }}>Sports Media Protection</div>
          </div>
        </Link>

        <div style={{ maxWidth: 500 }}>
          <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 10, lineHeight: 1.1 }}>Create your account</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", marginBottom: 36, lineHeight: 1.6 }}>Start protecting your sports media assets with AI-powered detection in minutes.</p>

          {success && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 24 }}>
              <CheckCircle size={18} color="#10b981" />
              <span style={{ fontSize: 14, color: "#10b981", fontWeight: 600 }}>Account created! Redirecting to dashboard...</span>
            </div>
          )}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 24 }}>
              <AlertCircle size={18} color="#ef4444" />
              <span style={{ fontSize: 14, color: "#ef4444" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 9, fontWeight: 700, letterSpacing: "0.07em" }}>FULL NAME</label>
              <div style={{ position: "relative" }}>
                <User size={17} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your full name" style={inputStyle}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "rgba(0,229,255,0.5)"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)"} />
              </div>
            </div>
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
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 6 characters"
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "rgba(0,229,255,0.5)"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)"} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 0 }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading || success} style={{ width: "100%", background: loading ? "rgba(0,229,255,0.5)" : "#00e5ff", color: "#050810", border: "none", borderRadius: 12, padding: "16px", fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, letterSpacing: "-0.01em" }}>
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#00e5ff", textDecoration: "none", fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right — benefits */}
      <div style={{ width: 500, background: "rgba(0,229,255,0.025)", borderLeft: "1px solid rgba(0,229,255,0.08)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 52px", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 11, color: "#00e5ff", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 36 }}>FREE PLAN INCLUDES</div>
        {[
          { icon: <Shield size={20} />, title: "Unlimited asset registration", desc: "Register as many media assets as you need with full perceptual fingerprinting included." },
          { icon: <Globe size={20} />, title: "YouTube platform scanning", desc: "AI-powered crawler detects violations across YouTube automatically on every scan." },
          { icon: <Zap size={20} />, title: "Gemini AI violation analysis", desc: "Every match analyzed with risk scoring from 0-100 and natural language reports." },
          { icon: <CheckCircle size={20} />, title: "Real-time dashboard", desc: "Live violations feed with severity indicators, AI reports, and one-click resolve." },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 16, marginBottom: 24, padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ color: "#00e5ff", flexShrink: 0, marginTop: 2, width: 36, height: 36, background: "rgba(0,229,255,0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{f.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 8, padding: "18px 20px", background: "rgba(0,229,255,0.04)", borderRadius: 14, border: "1px solid rgba(0,229,255,0.08)" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10, fontWeight: 700, letterSpacing: "0.06em" }}>SECURED BY</div>
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