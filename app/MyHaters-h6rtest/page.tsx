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

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<"logs" | "generate">("logs");
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [expiresIn, setExpiresIn] = useState("lifetime");
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<{ key: string; expires_at: string } | null>(null);
  const [genError, setGenError] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
    } catch {
      // silently ignore network errors
    } finally {
      setRefreshing(false);
    }
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
    } finally {
      setDeletingKey(null);
    }
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
    </main>
  );
}
