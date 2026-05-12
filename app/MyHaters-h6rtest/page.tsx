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
        const res = await fetch("/api/admin/setduration", {
          headers: { "x-admin-key": adminKey },
        });
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
      if (t === "config") loadLoaders();
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
        const res = await fetch(`/api/admin/setloader?name=${name}`, {
          headers: { "x-admin-key": adminKey },
        });
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
          body: JSON.stringify({
            admin_key: adminKey,
            name: editingLoader.name,
            script: editingLoader.script,
            obfuscate: editingLoader.obfuscate,
          }),
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
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🔐</div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-500 text-sm mt-1">H6rnyx KeyServer</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-4">
              <input
                type="password"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                onKeyDown={e => e.key === "Enter" && login()}
                placeholder="Contraseña de admin"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              {authError && <p className="text-red-400 text-xs">{authError}</p>}
              <button
                onClick={login}
                disabled={loading || !adminKey}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? "Verificando..." : "Entrar"}
              </button>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-500 text-sm">H6rnyx KeyServer</p>
          </div>
          <button onClick={refreshStats} disabled={refreshing}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            {refreshing ? "Actualizando..." : "↻ Actualizar"}
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Keys activas", value: stats.active, color: "text-green-400" },
              { label: "Total keys", value: stats.total, color: "text-white" },
              { label: "Generadas hoy", value: stats.generatedToday, color: "text-indigo-400" },
              { label: "Veces usadas", value: stats.usedKeys, color: "text-yellow-400" },
            ].map(s => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {(["logs", "generate", "config"] as const).map(t => (
            <button key={t} onClick={() => switchTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}>
              {t === "logs" ? "📋 Log de Keys" : t === "generate" ? "➕ Generar Key" : "⚙️ Configurar"}
            </button>
          ))}
        </div>

        {tab === "logs" && stats && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
                    <th className="text-left px-4 py-3">Key</th>
                    <th className="text-left px-4 py-3">Label</th>
                    <th className="text-left px-4 py-3">Estado</th>
                    <th className="text-left px-4 py-3">Roblox User</th>
                    <th className="text-left px-4 py-3">Último uso</th>
                    <th className="text-left px-4 py-3">Creada</th>
                    <th className="text-left px-4 py-3">Expira</th>
                    <th className="text-left px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {stats.keys.map(k => {
                    const expired = k.expires_at && new Date(k.expires_at) < new Date();
                    const active = k.is_active && !expired;
                    return (
                      <tr key={k.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-indigo-300 text-xs">{k.key.slice(0, 20)}…</span>
                            <button onClick={() => copyKey(k.key)} className="text-gray-500 hover:text-indigo-400 text-xs">
                              {copiedKey === k.key ? "✓" : "⎘"}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{k.label || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${active ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>
                            {active ? "Activa" : expired ? "Expirada" : "Inactiva"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{k.roblox_username || "—"}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{fmt(k.last_used_at)}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{fmt(k.created_at)}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{k.expires_at ? fmt(k.expires_at) : "♾️ Never"}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteKey(k.key)} disabled={deletingKey === k.key}
                            className="text-red-500 hover:text-red-400 disabled:opacity-50 text-xs font-medium">
                            {deletingKey === k.key ? "..." : "Eliminar"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {stats.keys.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-600">No hay keys</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "generate" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4 max-w-md">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Label (opcional)</label>
              <input value={label} onChange={e => setLabel(e.target.value)} placeholder="ej: VIP player"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Duración</label>
              <select value={expiresIn} onChange={e => setExpiresIn(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                {DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {genError && <p className="text-red-400 text-xs">{genError}</p>}
            {newKey && (
              <div className="bg-green-900/30 border border-green-800 rounded-lg p-3">
                <p className="text-green-400 text-xs mb-1">Key generada:</p>
                <div className="flex items-center gap-2">
                  <code className="text-green-300 text-xs font-mono break-all">{newKey.key}</code>
                  <button onClick={() => copyKey(newKey.key)} className="text-green-500 hover:text-green-400 text-xs shrink-0">
                    {copiedKey === newKey.key ? "✓" : "⎘"}
                  </button>
                </div>
                {newKey.expires_at && <p className="text-green-600 text-xs mt-1">Expira: {fmt(newKey.expires_at)}</p>}
              </div>
            )}
            <button onClick={generate} disabled={genLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors">
              {genLoading ? "Generando..." : "➕ Generar Key"}
            </button>
          </div>
        )}

        {tab === "config" && (
          <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4 max-w-md">
              <h2 className="text-white font-semibold">⏱️ Duración por defecto</h2>
              {loadingConfig ? <p className="text-gray-500 text-sm">Cargando...</p> : (
                <>
                  {currentDuration && (
                    <p className="text-gray-400 text-xs">Actual: <span className="text-indigo-400 font-mono">{currentDuration}</span></p>
                  )}
                  <select value={selectedDuration} onChange={e => { setSelectedDuration(e.target.value); setCustomDuration(""); }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                    {DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input value={customDuration} onChange={e => setCustomDuration(e.target.value)}
                    placeholder="O escribe uno custom: 10h, 3d..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
                  {durResult && <p className={`text-xs ${durResult.ok ? "text-green-400" : "text-red-400"}`}>{durResult.msg}</p>}
                  <button onClick={saveDuration} disabled={durSaving}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors">
                    {durSaving ? "Guardando..." : "Guardar duración"}
                  </button>
                </>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold">📜 Loaders</h2>
                <div className="flex gap-2">
                  <button onClick={loadLoaders} disabled={loadersLoading}
                    className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 px-3 py-1.5 rounded-lg text-xs transition-colors">
                    {loadersLoading ? "..." : "↻"}
                  </button>
                  <button onClick={openNewLoader}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                    + Nuevo loader
                  </button>
                </div>
              </div>
              {loaderResult && (
                <p className={`text-xs ${loaderResult.ok ? "text-green-400" : "text-red-400"}`}>{loaderResult.msg}</p>
              )}
              {loadersLoading ? (
                <p className="text-gray-500 text-sm">Cargando loaders...</p>
              ) : loaders.length === 0 ? (
                <p className="text-gray-600 text-sm">No hay loaders aún. Crea uno con el botón de arriba.</p>
              ) : (
                <div className="space-y-2">
                  {loaders.map(l => {
                    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/loader/${l.name}`;
                    return (
                      <div key={l.name} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 gap-3">
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium">{l.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-gray-500 text-xs font-mono">/loader/{l.name}</span>
                            <button onClick={() => copyUrl(url)} className="text-gray-600 hover:text-indigo-400 text-xs transition-colors">
                              {copiedUrl === url ? "✓ copiado" : "⎘ copiar URL"}
                            </button>
                          </div>
                          <p className="text-gray-600 text-xs mt-0.5">{l.bytes.toLocaleString()} bytes</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => openEditLoader(l.name)}
                            className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg text-xs transition-colors">
                            Editar
                          </button>
                          <button onClick={() => deleteLoader(l.name)} disabled={deletingLoader === l.name}
                            className="text-red-500 hover:text-red-400 disabled:opacity-50 text-xs font-medium transition-colors">
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

        {editingLoader && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">
                  {editingLoader.isNew ? "➕ Nuevo loader" : `✏️ Editar: ${editingLoader.name}`}
                </h3>
                <button onClick={() => setEditingLoader(null)} className="text-gray-500 hover:text-white text-xl">✕</button>
              </div>
              {editingLoader.isNew && (
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Nombre (letras, números, guiones)</label>
                  <input value={editingLoader.name}
                    onChange={e => setEditingLoader(prev => prev ? { ...prev, name: e.target.value } : prev)}
                    placeholder="ej: principal, vip, beta"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
                  {editingLoader.name && (
                    <p className="text-gray-500 text-xs mt-1">URL: /loader/{editingLoader.name.toLowerCase().replace(/[^a-z0-9_-]/g, "")}</p>
                  )}
                </div>
              )}
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Script (Lua)</label>
                <textarea value={editingLoader.script}
                  onChange={e => setEditingLoader(prev => prev ? { ...prev, script: e.target.value } : prev)}
                  rows={12} placeholder="-- Pega tu script de Lua aquí"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-indigo-500 resize-y" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={editingLoader.obfuscate}
                  onChange={e => setEditingLoader(prev => prev ? { ...prev, obfuscate: e.target.checked } : prev)}
                  className="w-4 h-4 accent-indigo-500" />
                <div>
                  <span className="text-white text-sm font-medium">🔒 Ofuscar script</span>
                  <p className="text-gray-500 text-xs">El script ejecutará igual pero el código será ilegible</p>
                </div>
              </label>
              {loaderResult && !loaderResult.ok && (
                <p className="text-red-400 text-xs">{loaderResult.msg}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingLoader(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-sm transition-colors">
                  Cancelar
                </button>
                <button onClick={saveLoader}
                  disabled={loaderSaving || !editingLoader.script.trim() || !editingLoader.name.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium text-sm transition-colors">
                  {loaderSaving ? "Guardando..." : editingLoader.obfuscate ? "💾 Guardar (ofuscado)" : "💾 Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }
  