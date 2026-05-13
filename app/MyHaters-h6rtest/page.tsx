"use client";

import { useState } from "react";

type KeyRow = {
  id: string;
  key: string;
  label: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  roblox_username: string | null;
};

type Stats = {
  active: number;
  total: number;
  generatedToday: number;
  usedKeys: number;
  keys: KeyRow[];
};

type LoaderRow = { name: string; bytes: number };

function fmt(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("es", { dateStyle: "short", timeStyle: "short" });
}

const DURATION_OPTIONS = [
  { value: "lifetime", label: "♾️ Lifetime (permanente)" },
  { value: "1h",  label: "⏱️ 1 hora" },
  { value: "2h",  label: "⏱️ 2 horas" },
  { value: "3h",  label: "⏱️ 3 horas" },
  { value: "5h",  label: "⏱️ 5 horas" },
  { value: "12h", label: "⏱️ 12 horas" },
  { value: "24h", label: "⏱️ 24 horas" },
  { value: "7d",  label: "📅 7 días" },
  { value: "30d", label: "📅 30 días" },
];

const cardStyle = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(139,92,246,0.18)",
  backdropFilter: "blur(12px)",
};

const inputStyle = {
  background: "rgba(0,0,0,0.5)",
  border: "1px solid rgba(139,92,246,0.2)",
  color: "#fff",
  outline: "none",
};

const btnPrimary = {
  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
  boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
  color: "#fff",
};

const btnSecondary = {
  background: "rgba(139,92,246,0.1)",
  border: "1px solid rgba(139,92,246,0.25)",
  color: "#c084fc",
};

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<"logs" | "generate" | "config">("logs");
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [expiresIn, setExpiresIn] = useState("lifetime");
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<{ key: string; expires_at: string } | null>(null);
  const [genError, setGenError] = useState("");
  const [genLoading, setGenLoading] = useState(false);

  const [currentDuration, setCurrentDuration] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState("2h");
  const [customDuration, setCustomDuration] = useState("");
  const [durSaving, setDurSaving] = useState(false);
  const [durResult, setDurResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  const [loaders, setLoaders] = useState<LoaderRow[]>([]);
  const [loadersLoading, setLoadersLoading] = useState(false);
  const [deletingLoader, setDeletingLoader] = useState<string | null>(null);
  const [editingLoader, setEditingLoader] = useState<{ name: string; script: string; obfuscate: boolean; isNew: boolean } | null>(null);
  const [loaderSaving, setLoaderSaving] = useState(false);
  const [loaderResult, setLoaderResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const login = async () => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_key: adminKey }),
      });
      const data = await res.json();
      if (!res.ok) { setAuthError("Contraseña incorrecta."); return; }
      setStats(data);
      setAuthed(true);
    } catch {
      setAuthError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_key: adminKey }),
      });
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
    finally { setRefreshing(false); }
  };

  const loadConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch("/api/admin/setduration", { headers: { "x-admin-key": adminKey } });
      if (res.ok) {
        const data = await res.json();
        setCurrentDuration(data.duration);
        setSelectedDuration(data.duration);
        setCustomDuration("");
      }
    } catch { /* ignore */ }
    finally { setLoadingConfig(false); }
  };

  const loadLoaders = async () => {
    setLoadersLoading(true);
    try {
      const res = await fetch("/api/admin/listloaders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_key: adminKey }),
      });
      if (res.ok) {
        const data = await res.json();
        setLoaders(data.loaders ?? []);
      }
    } catch { /* ignore */ }
    finally { setLoadersLoading(false); }
  };

  const switchTab = (t: "logs" | "generate" | "config") => {
    setTab(t);
    if (t === "config" && currentDuration === null) loadConfig();
    if (t === "config" && loaders.length === 0 && !loadersLoading) loadLoaders();
  };

  const deleteKey = async (key: string) => {
    if (!confirm(`¿Eliminar la key ${key.slice(0, 20)}...?`)) return;
    setDeletingKey(key);
    try {
      const res = await fetch("/api/admin/deletekey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_key: adminKey, key }),
      });
      if (res.ok) await refreshStats();
    } finally { setDeletingKey(null); }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const generate = async () => {
    setGenLoading(true);
    setNewKey(null);
    setGenError("");
    try {
      const res = await fetch("/api/generatekey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_key: adminKey, expires_in: expiresIn, label }),
      });
      const data = await res.json();
      if (!res.ok || !data.key) { setGenError(data.error || "Error."); return; }
      setNewKey({ key: data.key, expires_at: data.expires_at });
      setLabel("");
      await refreshStats();
    } catch { setGenError("Error de conexión."); }
    finally { setGenLoading(false); }
  };

  const saveDuration = async () => {
    const duration = customDuration.trim() || selectedDuration;
    if (!duration) return;
    setDurSaving(true);
    setDurResult(null);
    try {
      const res = await fetch("/api/admin/setduration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_key: adminKey, duration }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDurResult({ ok: false, msg: data.error || "Error al guardar." });
      } else {
        setCurrentDuration(duration);
        setDurResult({ ok: true, msg: `✅ Guardado: ${duration}. ${data.updatedCount} key(s) actualizada(s).` });
      }
    } catch { setDurResult({ ok: false, msg: "Error de conexión." }); }
    finally { setDurSaving(false); }
  };

  const openNewLoader = () => {
    setEditingLoader({ name: "", script: "", obfuscate: true, isNew: true });
    setLoaderResult(null);
  };

  const openEditLoader = async (name: string) => {
    setLoaderResult(null);
    setEditingLoader({ name, script: "Cargando...", obfuscate: false, isNew: false });
    try {
      const res = await fetch(`/api/admin/setloader?name=${name}`, { headers: { "x-admin-key": adminKey } });
      if (res.ok) {
        const data = await res.json();
        setEditingLoader({ name, script: data.script ?? "", obfuscate: false, isNew: false });
      }
    } catch { /* ignore */ }
  };

  const saveLoader = async () => {
    if (!editingLoader) return;
    setLoaderSaving(true);
    setLoaderResult(null);
    try {
      const res = await fetch("/api/admin/setloader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_key: adminKey, name: editingLoader.name, script: editingLoader.script, obfuscate: editingLoader.obfuscate }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoaderResult({ ok: false, msg: data.error || "Error al guardar." });
      } else {
        setLoaderResult({ ok: true, msg: `✅ Loader "${data.name}" guardado (${data.bytes} bytes).` });
        setEditingLoader(null);
        await loadLoaders();
      }
    } catch { setLoaderResult({ ok: false, msg: "Error de conexión." }); }
    finally { setLoaderSaving(false); }
  };

  const deleteLoader = async (name: string) => {
    if (!confirm(`¿Eliminar el loader "${name}"?`)) return;
    setDeletingLoader(name);
    try {
      const res = await fetch("/api/admin/deleteloader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_key: adminKey, name }),
      });
      if (res.ok) setLoaders(prev => prev.filter(l => l.name !== name));
    } finally { setDeletingLoader(null); }
  };

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.15),transparent)] pointer-events-none" />
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-800/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))", border: "1px solid rgba(139,92,246,0.25)", boxShadow: "0 0 30px rgba(139,92,246,0.1)"}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="url(#lg1)" strokeWidth="1.5"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="url(#lg2)" strokeWidth="1.5" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="lg1" x1="3" y1="11" x2="21" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#a855f7"/><stop offset="1" stopColor="#ec4899"/></linearGradient>
                  <linearGradient id="lg2" x1="7" y1="7" x2="17" y2="11" gradientUnits="userSpaceOnUse"><stop stopColor="#a855f7"/><stop offset="1" stopColor="#ec4899"/></linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              <span style={{background: "linear-gradient(135deg, #fff 0%, #e9d5ff 40%, #a855f7 70%, #ec4899 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}}>
                Admin Panel
              </span>
            </h1>
            <p className="text-sm font-medium" style={{background: "linear-gradient(90deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}}>
              H6rnyx KeyServer
            </p>
          </div>
          <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
            <div>
              <label className="text-zinc-400 text-xs font-medium mb-2 block">Contraseña de Admin</label>
              <input
                type="password"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                onKeyDown={e => e.key === "Enter" && login()}
                placeholder="••••••••••••"
                className="w-full rounded-xl px-4 py-2.5 text-sm transition-all focus:ring-1"
                style={inputStyle}
              />
            </div>
            {authError && <p className="text-red-400 text-xs">{authError}</p>}
            <button
              onClick={login}
              disabled={loading || !adminKey}
              className="w-full py-2.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={btnPrimary}>
              {loading ? "Verificando..." : "Entrar →"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const tabs = [
    { id: "logs" as const, label: "Log de Keys", icon: "📋" },
    { id: "generate" as const, label: "Generar Key", icon: "✦" },
    { id: "config" as const, label: "Configurar", icon: "⚙" },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-purple-900/8 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span style={{background: "linear-gradient(135deg, #fff 0%, #e9d5ff 40%, #a855f7 80%, #ec4899 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}}>
              Admin Panel
            </span>
          </h1>
          <p className="text-sm font-medium mt-0.5" style={{background: "linear-gradient(90deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}}>
            H6rnyx KeyServer
          </p>
        </div>
        <button
          onClick={refreshStats}
          disabled={refreshing}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 active:scale-[0.97]"
          style={btnSecondary}>
          {refreshing ? "..." : "↻ Actualizar"}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Keys activas", value: stats.active, gradient: "linear-gradient(135deg, #a855f7, #ec4899)" },
            { label: "Total keys", value: stats.total, gradient: "linear-gradient(135deg, #e9d5ff, #a855f7)" },
            { label: "Generadas hoy", value: stats.generatedToday, gradient: "linear-gradient(135deg, #7c3aed, #a855f7)" },
            { label: "Veces usadas", value: stats.usedKeys, gradient: "linear-gradient(135deg, #c084fc, #f0abfc)" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5 text-center relative overflow-hidden" style={cardStyle}>
              <div className="absolute inset-0 opacity-[0.03]" style={{background: s.gradient}} />
              <p className="text-3xl font-bold" style={{background: s.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}}>{s.value}</p>
              <p className="text-zinc-500 text-xs mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.97]"
            style={tab === t.id
              ? {background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", boxShadow: "0 4px 16px rgba(124,58,237,0.3)"}
              : {background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.15)", color: "#71717a"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* LOGS */}
      {tab === "logs" && stats && (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{borderBottom: "1px solid rgba(139,92,246,0.15)"}}>
                  {["Key", "Label", "Estado", "Roblox", "Último uso", "Creada", "Expira", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.keys.map(k => {
                  const expired = k.expires_at && new Date(k.expires_at) < new Date();
                  const active = k.is_active && !expired;
                  return (
                    <tr key={k.id} className="transition-colors hover:bg-white/[0.02]" style={{borderBottom: "1px solid rgba(255,255,255,0.03)"}}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs" style={{color: "#c084fc"}}>{k.key.slice(0, 18)}…</span>
                          <button onClick={() => copyKey(k.key)} className="transition-colors text-xs" style={{color: copiedKey === k.key ? "#a855f7" : "#52525b"}}>
                            {copiedKey === k.key ? "✓" : "⎘"}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{k.label || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={active
                            ? {background: "rgba(139,92,246,0.15)", color: "#c084fc", border: "1px solid rgba(139,92,246,0.3)"}
                            : {background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)"}}>
                          {active ? "Activa" : expired ? "Expirada" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{k.roblox_username || "—"}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{fmt(k.last_used_at)}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{fmt(k.created_at)}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{k.expires_at ? fmt(k.expires_at) : "♾️"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteKey(k.key)} disabled={deletingKey === k.key}
                          className="text-xs font-semibold transition-colors disabled:opacity-40"
                          style={{color: "#f87171"}}>
                          {deletingKey === k.key ? "..." : "Eliminar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {stats.keys.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-600 text-sm">No hay keys registradas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GENERATE */}
      {tab === "generate" && (
        <div className="rounded-2xl p-6 space-y-4 max-w-md" style={cardStyle}>
          <h2 className="font-bold text-base" style={{background: "linear-gradient(90deg, #e9d5ff, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}}>
            Generar nueva key
          </h2>
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Label (opcional)</label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="ej: VIP player"
              className="w-full rounded-xl px-4 py-2.5 text-sm transition-all" style={inputStyle} />
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Duración</label>
            <select value={expiresIn} onChange={e => setExpiresIn(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle}>
              {DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {genError && <p className="text-red-400 text-xs">{genError}</p>}
          {newKey && (
            <div className="rounded-xl p-4" style={{background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)"}}>
              <p className="text-xs font-semibold mb-2" style={{color: "#a855f7"}}>Key generada exitosamente</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono break-all flex-1" style={{color: "#d8b4fe"}}>{newKey.key}</code>
                <button onClick={() => copyKey(newKey.key)} className="shrink-0 text-xs transition-colors" style={{color: copiedKey === newKey.key ? "#a855f7" : "#71717a"}}>
                  {copiedKey === newKey.key ? "✓" : "⎘"}
                </button>
              </div>
              {newKey.expires_at && <p className="text-zinc-500 text-xs mt-1.5">Expira: {fmt(newKey.expires_at)}</p>}
            </div>
          )}
          <button onClick={generate} disabled={genLoading}
            className="w-full py-2.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            style={btnPrimary}>
            {genLoading ? "Generando..." : "✦ Generar Key"}
          </button>
        </div>
      )}

      {/* CONFIG */}
      {tab === "config" && (
        <div className="space-y-6">
          <div className="rounded-2xl p-6 space-y-4 max-w-md" style={cardStyle}>
            <h2 className="font-bold text-base" style={{background: "linear-gradient(90deg, #e9d5ff, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}}>
              ⏱ Duración por defecto
            </h2>
            {loadingConfig ? (
              <p className="text-zinc-500 text-sm">Cargando...</p>
            ) : (
              <>
                {currentDuration && (
                  <p className="text-zinc-400 text-xs">Actual: <span className="font-mono font-semibold" style={{color: "#a855f7"}}>{currentDuration}</span></p>
                )}
                <select value={selectedDuration} onChange={e => { setSelectedDuration(e.target.value); setCustomDuration(""); }}
                  className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle}>
                  {DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <input value={customDuration} onChange={e => setCustomDuration(e.target.value)}
                  placeholder="O escribe uno custom: 10h, 3d..."
                  className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
                {durResult && <p className={`text-xs font-medium ${durResult.ok ? "" : "text-red-400"}`} style={durResult.ok ? {color: "#a855f7"} : {}}>{durResult.msg}</p>}
                <button onClick={saveDuration} disabled={durSaving}
                  className="w-full py-2.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                  style={btnPrimary}>
                  {durSaving ? "Guardando..." : "Guardar duración"}
                </button>
              </>
            )}
          </div>

          <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base" style={{background: "linear-gradient(90deg, #e9d5ff, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}}>
                📜 Loaders
              </h2>
              <div className="flex gap-2">
                <button onClick={loadLoaders} disabled={loadersLoading}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-50" style={btnSecondary}>
                  {loadersLoading ? "..." : "↻"}
                </button>
                <button onClick={openNewLoader}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all" style={btnPrimary}>
                  + Nuevo
                </button>
              </div>
            </div>
            {loaderResult && <p className={`text-xs font-medium ${loaderResult.ok ? "" : "text-red-400"}`} style={loaderResult.ok ? {color: "#a855f7"} : {}}>{loaderResult.msg}</p>}
            {loadersLoading ? (
              <p className="text-zinc-500 text-sm">Cargando loaders...</p>
            ) : loaders.length === 0 ? (
              <p className="text-zinc-600 text-sm">No hay loaders. Crea uno arriba.</p>
            ) : (
              <div className="space-y-2">
                {loaders.map(l => {
                  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/loader/${l.name}`;
                  return (
                    <div key={l.name} className="flex items-center justify-between rounded-xl px-4 py-3 gap-3"
                      style={{background: "rgba(0,0,0,0.3)", border: "1px solid rgba(139,92,246,0.12)"}}>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold">{l.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-zinc-600 text-xs font-mono">/loader/{l.name}</span>
                          <button onClick={() => copyUrl(url)} className="text-xs transition-colors" style={{color: copiedUrl === url ? "#a855f7" : "#52525b"}}>
                            {copiedUrl === url ? "✓ copiado" : "⎘ copiar"}
                          </button>
                        </div>
                        <p className="text-zinc-600 text-xs mt-0.5">{l.bytes.toLocaleString()} bytes</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => openEditLoader(l.name)}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all" style={btnSecondary}>
                          Editar
                        </button>
                        <button onClick={() => deleteLoader(l.name)} disabled={deletingLoader === l.name}
                          className="text-xs font-semibold transition-colors disabled:opacity-40" style={{color: "#f87171"}}>
                          {deletingLoader === l.name ? "..." : "Eliminar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL */}
      {editingLoader && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)"}}>
          <div className="w-full max-w-2xl rounded-2xl p-6 space-y-4" style={{background: "#0a0a0f", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 60px rgba(139,92,246,0.15)"}}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{background: "linear-gradient(90deg, #e9d5ff, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}}>
                {editingLoader.isNew ? "✦ Nuevo loader" : `✎ Editar: ${editingLoader.name}`}
              </h3>
              <button onClick={() => setEditingLoader(null)} className="text-zinc-500 hover:text-white transition-colors text-xl leading-none">✕</button>
            </div>
            {editingLoader.isNew && (
              <div>
                <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Nombre del loader</label>
                <input value={editingLoader.name}
                  onChange={e => setEditingLoader(prev => prev ? { ...prev, name: e.target.value } : prev)}
                  placeholder="ej: principal, vip, beta"
                  className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
                {editingLoader.name && (
                  <p className="text-zinc-600 text-xs mt-1">URL: /loader/{editingLoader.name.toLowerCase().replace(/[^a-z0-9_-]/g, "")}</p>
                )}
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-zinc-400 text-xs font-medium">Script (Lua)</label>
                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#c084fc"}}>
                  📁 Subir archivo
                  <input type="file" accept=".lua,.txt" className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => {
                        const text = ev.target?.result as string;
                        setEditingLoader(prev => prev ? { ...prev, script: text } : prev);
                      };
                      reader.readAsText(file);
                      e.target.value = "";
                    }} />
                </label>
              </div>
              <textarea value={editingLoader.script}
                onChange={e => setEditingLoader(prev => prev ? { ...prev, script: e.target.value } : prev)}
                rows={12}
                placeholder="-- Pega tu script de Lua aquí"
                className="w-full rounded-xl px-4 py-2.5 text-sm font-mono resize-y"
                style={{...inputStyle, minHeight: "200px"}} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={editingLoader.obfuscate}
                onChange={e => setEditingLoader(prev => prev ? { ...prev, obfuscate: e.target.checked } : prev)}
                className="w-4 h-4" style={{accentColor: "#a855f7"}} />
              <div>
                <span className="text-white text-sm font-semibold">🔒 Ofuscar script</span>
                <p className="text-zinc-600 text-xs">El código será ilegible pero funcionará igual</p>
              </div>
            </label>
            {loaderResult && !loaderResult.ok && <p className="text-red-400 text-xs">{loaderResult.msg}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditingLoader(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all" style={btnSecondary}>
                Cancelar
              </button>
              <button onClick={saveLoader}
                disabled={loaderSaving || !editingLoader.script.trim() || !editingLoader.name.trim()}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                style={btnPrimary}>
                {loaderSaving ? "Guardando..." : editingLoader.obfuscate ? "💾 Guardar (ofuscado)" : "💾 Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
