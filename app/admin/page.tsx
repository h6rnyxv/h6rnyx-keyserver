"use client";

import { useState } from "react";

const DISCORD_INVITE = process.env.NEXT_PUBLIC_DISCORD_INVITE || "https://discord.gg/tu-servidor";

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

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<"logs" | "generate">("logs");

  // Generate key state
  const [expiresIn, setExpiresIn] = useState("lifetime");
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<{ key: string; expires_at: string } | null>(null);
  const [genError, setGenError] = useState("");
  const [genLoading, setGenLoading] = useState(false);

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
    const res = await fetch("/api/admin/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_key: adminKey }),
    });
    if (res.ok) setStats(await res.json());
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
    } catch {
      setGenError("Error de conexión.");
    } finally {
      setGenLoading(false);
    }
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
        <div className="flex gap-3">
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <svg width="18" height="14" viewBox="0 0 71 55" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M60.1 4.9A58.8 58.8 0 0 0 45.7.4a.2.2 0 0 0-.2.1 40.9 40.9 0 0 0-1.8 3.7 54.3 54.3 0 0 0-16.3 0A37.5 37.5 0 0 0 25.6.5a.2.2 0 0 0-.2-.1A58.6 58.6 0 0 0 11 4.9a.2.2 0 0 0-.1.1C1.6 18.7-1 32.2.3 45.5a.2.2 0 0 0 .1.2 59.1 59.1 0 0 0 17.8 9 .2.2 0 0 0 .2-.1 42.2 42.2 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.9 38.9 0 0 1-5.6-2.7.2.2 0 0 1 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 0 1 .2 0c11.7 5.4 24.4 5.4 36 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.8 36.8 0 0 1-5.6 2.7.2.2 0 0 0-.1.3 47.3 47.3 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.9 58.9 0 0 0 17.8-9 .2.2 0 0 0 .1-.2C73 30.1 70.2 16.7 60.2 5a.2.2 0 0 0-.1-.1ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z"/>
            </svg>
            Discord
          </a>
          <button
            onClick={refreshStats}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            ↻ Actualizar
          </button>
        </div>
      </div>

      {/* Stats */}
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["logs", "generate"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {t === "logs" ? "📋 Log de Keys" : "➕ Generar Key"}
          </button>
        ))}
      </div>

      {/* Log Tab */}
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
                </tr>
              </thead>
              <tbody>
                {stats.keys.map(k => {
                  const expired = k.expires_at && new Date(k.expires_at) < new Date();
                  const active = k.is_active && !expired;
                  return (
                    <tr key={k.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-mono text-indigo-300 text-xs">{k.key.slice(0, 20)}…</td>
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
                    </tr>
                  );
                })}
                {stats.keys.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">No hay keys</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Tab */}
      {tab === "generate" && (
        <div className="max-w-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div>
              <label className="text-gray-400 text-xs uppercase mb-1 block">Tipo</label>
              <select
                value={expiresIn}
                onChange={e => setExpiresIn(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="lifetime">♾️ Lifetime (permanente)</option>
                <option value="2h">⏱️ 2 horas</option>
                <option value="24h">⏱️ 24 horas</option>
                <option value="7d">📅 7 días</option>
                <option value="30d">📅 30 días</option>
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
                onClick={() => { navigator.clipboard.writeText(newKey.key); alert("Copiado"); }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
              >
                Copiar
              </button>
            </div>
          )}
          {genError && <p className="mt-3 text-red-400 text-sm">{genError}</p>}
        </div>
      )}
    </main>
  );
}
