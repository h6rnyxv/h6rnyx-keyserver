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

  // Generate tab
  const [expiresIn, setExpiresIn] = useState("lifetime");
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<{ key: string; expires_at: string } | null>(null);
  const [genError, setGenError] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Config — duración
  const [currentDuration, setCurrentDuration] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState("2h");
  const [customDuration, setCustomDuration] = useState("");
  const [durSaving, setDurSaving] = useState(false);
  const [durResult, setDurResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Config — script
  const [scriptContent, setScriptContent] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptSaving, setScriptSaving] = useState(false);
  const [scriptResult, setScriptResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

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

  const loadScript = async () => {
    setScriptLoading(true);
    setScriptResult(null);
    try {
      const res = await fetch("/api/admin/setloader", {
        headers: { "x-admin-key": adminKey },
      });
      if (res.ok) {
        const data = await res.json();
        setScriptContent(data.script ?? "");
        setScriptLoaded(true);
      }
    } catch { /* ignore */ }
    finally { setScriptLoading(false); }
  };

  const switchTab = (t: "logs" | "generate" | "config") => {
    setTab(t);
    if (t === "config" && currentDuration === null) loadConfig();
    if (t === "config" && !scriptLoaded) loadScript();
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

  const saveScript = async () => {
    if (!scriptContent.trim()) return;
    setScriptSaving(true);
    setScriptResult(null);
    try {
      const res = await fetch("/api/admin/setloader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_key: adminKey, script: scriptContent }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setScriptResult({ ok: false, msg: data.error || "Error al guardar." });
      } else {
        setScriptResult({ ok: true, msg: `✅ Script guardado (${data.bytes} bytes). URL: /loader` });
      }
    } catch { setScriptResult({ ok: false, msg: "Error de conexión." }); }
    finally { setScriptSaving(false); }
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
        <button
          onClick={refreshStats}
          disabled={refreshing}
          className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
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
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {t === "logs" ? "📋 Log de Keys" : t === "generate" ? "➕ Generar Key" : "⚙️ Configurar"}
          </button>
        ))}
      </div>

      {/* ── LOGS ── */}
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
                          <button
                            onClick={() => copyKey(k.key)}
                            className="text-gray-500 hover:text-indigo-400 transition-colors text-xs"
                            title="Copiar key completa"
                          >
                            {copiedKey === k.key ? "✓" : "⎘"}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{k.label || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          active ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"
                        }`}>
                          {active ? "Activa" : expired ? "Expirada" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{k.roblox_username || "—"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{fmt(k.last_used_at)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{fmt(k.created_at)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{k.expires_at ? fmt(k.expires_at) : "♾️ Never"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteKey(k.key)}
                          disabled={deletingKey === k.key}
                          className="text-red-500 hover:text-red-400 disabled:opacity-50 text-xs font-medium transition-colors"
                        >
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

      {/* ── GENERATE ── */}
      {tab === "generate" && (
        <div className="max-w-md">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div>
              <label className="text-gray-400 text-xs uppercase mb-1 block">Duración</label>
              <select
                value={expiresIn}
                onChange={e => setExpiresIn(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {DURATION_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase mb-1 block">Label (opcional)</label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="ej: amigo, tester..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={generate}
              disabled={genLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors"
            >
              {genLoading ? "Generando..." : "Generar Key"}
            </button>
          </div>
          {newKey && (
            <div className="mt-4 bg-gray-900 rounded-xl p-5 border border-green-700">
              <p className="text-green-400 font-semibold mb-3">✓ Key generada</p>
              <div className="bg-gray-800 rounded-lg p-3 mb-3">
                <code className="text-indigo-300 text-sm break-all">{newKey.key}</code>
              </div>
              <p className="text-gray-500 text-xs mb-3">Expira: {newKey.expires_at === "never" ? "Nunca" : newKey.expires_at}</p>
              <button
                onClick={() => copyKey(newKey.key)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
              >
                {copiedKey === newKey.key ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
          )}
          {genError && <p className="mt-3 text-red-400 text-sm">{genError}</p>}
        </div>
      )}

      {/* ── CONFIG ── */}
      {tab === "config" && (
        <div className="space-y-6">

          {/* Duración */}
          <div className="max-w-md bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-white font-semibold mb-1">Duración por defecto de keys</h2>
              <p className="text-gray-500 text-xs leading-relaxed">
                Duración que tendrán las keys generadas por usuarios. Al guardar, las keys activas con menos tiempo restante serán extendidas.
              </p>
            </div>
            {loadingConfig ? (
              <p className="text-gray-500 text-sm">Cargando...</p>
            ) : (
              <div className="bg-gray-800 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-gray-400 text-xs uppercase">Duración actual</span>
                <span className="text-indigo-300 font-mono font-semibold">{currentDuration ?? "—"}</span>
              </div>
            )}
            <div>
              <label className="text-gray-400 text-xs uppercase mb-1 block">Nueva duración</label>
              <select
                value={selectedDuration}
                onChange={e => { setSelectedDuration(e.target.value); setCustomDuration(""); }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 mb-2"
              >
                {DURATION_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={customDuration}
                onChange={e => setCustomDuration(e.target.value)}
                placeholder="O escribe manualmente: 3h, 6h, 2d..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={saveDuration}
              disabled={durSaving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors"
            >
              {durSaving ? "Guardando..." : "Guardar y aplicar a keys activas"}
            </button>
            {durResult && (
              <div className={`rounded-lg px-4 py-3 text-sm ${
                durResult.ok
                  ? "bg-green-900/30 border border-green-700 text-green-300"
                  : "bg-red-900/30 border border-red-700 text-red-300"
              }`}>
                {durResult.msg}
              </div>
            )}
          </div>

          {/* Script Editor */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-white font-semibold mb-1">Script del Loader</h2>
              <p className="text-gray-500 text-xs leading-relaxed">
                El script que se sirve en{" "}
                <code className="text-indigo-400 bg-gray-800 px-1 py-0.5 rounded">
                  https://h6rnyx-keyserver.vercel.app/loader
                </code>
                . Pega aquí el nuevo Lua y guarda.
              </p>
            </div>

            {scriptLoading ? (
              <p className="text-gray-500 text-sm">Cargando script actual...</p>
            ) : (
              <>
                <textarea
                  value={scriptContent}
                  onChange={e => setScriptContent(e.target.value)}
                  placeholder="Pega aquí tu script de Lua..."
                  rows={20}
                  spellCheck={false}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-green-300 text-xs font-mono focus:outline-none focus:border-indigo-500 resize-y"
                />
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs">{scriptContent.length.toLocaleString()} chars</span>
                  <div className="flex gap-2">
                    <button
                      onClick={loadScript}
                      disabled={scriptLoading}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      ↻ Recargar
                    </button>
                    <button
                      onClick={saveScript}
                      disabled={scriptSaving || !scriptContent.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {scriptSaving ? "Guardando..." : "Guardar script"}
                    </button>
                  </div>
                </div>
                {scriptResult && (
                  <div className={`rounded-lg px-4 py-3 text-sm ${
                    scriptResult.ok
                      ? "bg-green-900/30 border border-green-700 text-green-300"
                      : "bg-red-900/30 border border-red-700 text-red-300"
                  }`}>
                    {scriptResult.msg}
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      )}
    </main>
  );
}
