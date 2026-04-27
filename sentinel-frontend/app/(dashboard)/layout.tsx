"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderOpen, AlertTriangle, Scan, LogOut, ChevronRight } from "lucide-react";
import { clearAuth, isAuthenticated, getUser } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", desc: "Command center" },
  { href: "/assets", icon: FolderOpen, label: "Assets", desc: "Protected media" },
  { href: "/violations", icon: AlertTriangle, label: "Violations", desc: "Threat feed" },
  { href: "/scan", icon: Scan, label: "Scan", desc: "AI detection" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    setUser(getUser());
  }, []);

  const handleLogout = () => { clearAuth(); router.push("/login"); };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#050810" }}>
      <aside style={{ width: 240, flexShrink: 0, background: "#080c18", borderRight: "1px solid rgba(0,229,255,0.07)", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 40 }}>

        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/logo.webp" alt="SentinelAI" style={{ height: 44, width: 44, objectFit: "contain" }} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1 }}>Sentinel<span style={{ color: "#00e5ff" }}>AI</span></div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>Sports Media Protection</div>
            </div>
          </Link>
        </div>

        {/* Live indicator */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(16,185,129,0.06)", borderRadius: 8, border: "1px solid rgba(16,185,129,0.1)" }}>
            <div className="animate-pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>MONITORING ACTIVE</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 700, letterSpacing: "0.08em", padding: "0 8px", marginBottom: 8 }}>NAVIGATION</div>
          {navItems.map(({ href, icon: Icon, label, desc }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, marginBottom: 2, textDecoration: "none", transition: "all 0.15s", background: active ? "rgba(0,229,255,0.08)" : "transparent", border: active ? "1px solid rgba(0,229,255,0.12)" : "1px solid transparent" }}>
                <div style={{ color: active ? "#00e5ff" : "rgba(255,255,255,0.35)", flexShrink: 0 }}><Icon size={16} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#fff" : "rgba(255,255,255,0.5)" }}>{label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 1 }}>{desc}</div>
                </div>
                {active && <ChevronRight size={12} color="#00e5ff" />}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          {user && (
            <div style={{ padding: "10px 12px", marginBottom: 8, background: "rgba(255,255,255,0.02)", borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>{user.name || user.email?.split("@")[0]}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            </div>
          )}
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 10, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.08)", cursor: "pointer", color: "rgba(239,68,68,0.6)", fontSize: 13 }}>
            <LogOut size={14} />Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: 240, minHeight: "100vh", background: "#050810" }}>
        {children}
      </main>
    </div>
  );
}