"use client";
import { useEffect, useState, useRef } from "react";
import { Upload, Trash2, Shield, FileImage, CheckCircle, AlertCircle } from "lucide-react";
import { assets as assetsAPI } from "@/lib/api";

export default function AssetsPage() {
  const [assetList, setAssetList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success"|"error">("success");
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const res = await assetsAPI.list();
      setAssetList(res.data.assets || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setMsg("Please select a file"); setMsgType("error"); return; }
    setUploading(true);
    setMsg("");
    const form = new FormData();
    form.append("name", name);
    form.append("owner", owner);
    form.append("territories", "global");
    form.append("media", file);
    try {
      const res = await assetsAPI.upload(form);
      setMsg(`Asset registered! Fingerprint: ${res.data.phash?.slice(0, 20)}...`);
      setMsgType("success");
      setName(""); setOwner(""); setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (err: any) {
      setMsg(err.response?.data?.error || "Upload failed");
      setMsgType("error");
    } finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this asset?")) return;
    await assetsAPI.delete(id);
    setAssetList(p => p.filter(a => a.id !== id));
  };

  return (
    <div style={{ padding: "36px 36px 80px" }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 500, marginBottom: 6 }}>Asset manager</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Register and fingerprint official sports media</p>
      </div>

      {/* Upload form */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 16, padding: 28, marginBottom: 32 }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 20, color: "#00e5ff" }}>Register new asset</h2>
        {msg && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: msgType === "success" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${msgType === "success" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 8, padding: "10px 14px", marginBottom: 18 }}>
            {msgType === "success" ? <CheckCircle size={14} color="#10b981" /> : <AlertCircle size={14} color="#ef4444" />}
            <span style={{ fontSize: 12, color: msgType === "success" ? "#10b981" : "#ef4444" }}>{msg}</span>
          </div>
        )}
        <form onSubmit={handleUpload}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 7, letterSpacing: "0.06em" }}>ASSET NAME</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. IPL Final 2024 Highlights"
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 7, letterSpacing: "0.06em" }}>RIGHTS OWNER</label>
              <input value={owner} onChange={e => setOwner(e.target.value)} required placeholder="e.g. BCCI, UEFA, FIFA"
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none" }} />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 7, letterSpacing: "0.06em" }}>MEDIA FILE (JPG, PNG)</label>
            <div onClick={() => fileRef.current?.click()} style={{ border: "1px dashed rgba(0,229,255,0.2)", borderRadius: 10, padding: "24px", textAlign: "center", cursor: "pointer", background: file ? "rgba(0,229,255,0.04)" : "transparent", transition: "all 0.2s" }}>
              <FileImage size={24} color={file ? "#00e5ff" : "rgba(255,255,255,0.2)"} style={{ margin: "0 auto 8px", display: "block" }} />
              <p style={{ fontSize: 13, color: file ? "#00e5ff" : "rgba(255,255,255,0.3)" }}>{file ? file.name : "Click to select image"}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: 4 }}>JPG, PNG up to 10MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
          </div>
          <button type="submit" disabled={uploading} style={{ display: "flex", alignItems: "center", gap: 8, background: uploading ? "rgba(0,229,255,0.4)" : "#00e5ff", color: "#0a0f1e", border: "none", borderRadius: 9, padding: "12px 22px", fontSize: 13, fontWeight: 500, cursor: uploading ? "not-allowed" : "pointer" }}>
            <Upload size={14} />
            {uploading ? "Fingerprinting..." : "Register & fingerprint"}
          </button>
        </form>
      </div>

      {/* Asset list */}
      <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>Protected assets ({assetList.length})</h2>
      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Loading assets...</p>
      ) : assetList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.01)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
          <Shield size={36} color="rgba(255,255,255,0.08)" style={{ margin: "0 auto 12px", display: "block" }} />
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>No assets registered yet. Upload your first media file above.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {assetList.map(a => (
            <div key={a.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,229,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Shield size={16} color="#00e5ff" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{a.owner}</div>
                  </div>
                </div>
                <button onClick={() => handleDelete(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", background: "rgba(0,0,0,0.2)", borderRadius: 6, padding: "6px 10px", wordBreak: "break-all" }}>
                {a.phash?.slice(0, 40)}...
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.15)" }}>Protected</span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)" }}>{a.territories}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}