"use client";

import { useState } from "react";

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [expiresIn, setExpiresIn] = useState("lifetime");
  const [label, setLabel] = useState("");
  const [result, setResult] = useState<{ key: string; expires_at: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/generatekey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_key: adminKey, expires_in: expiresIn, label }),
      });
      const data = await res.json();
      if (!res.ok || !data.key) {
        setError(data.error || "Error al generar la key.");
      } else {
        setResult({ key: data.key, expires_at: data.expires_at });
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-2 text-white">Admin Panel</h1>
      <p className="text-gray-500 text-sm mb-8">Genera keys manualmente</p>

      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-4 text-left">
        <div>
          <label className="text-gray-400 text-xs uppercase mb-1 block">Admin Key</label>
          <input
            type="password"
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-gray-400 text-xs uppercase mb-1 block">Tipo</label>
          <select
            value={expiresIn}
            onChange={e => setExpiresIn(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="lifetime">Lifetime (permanente)</option>
            <option value="2h">2 horas</option>
            <option value="24h">24 horas</option>
            <option value="7d">7 días</option>
            <option value="30d">30 días</option>
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
          disabled={loading || !adminKey}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? "Generando..." : "Generar Key"}
        </button>
      </div>

      {result && (
        <div className="mt-6 bg-gray-900 rounded-xl p-6 border border-green-700 text-left">
          <p className="text-green-400 font-semibold mb-3">✓ Key generada</p>
          <div className="bg-gray-800 rounded-lg p-3 mb-3">
            <code className="text-indigo-300 text-sm break-all">{result.key}</code>
          </div>
          <p className="text-gray-500 text-xs">Expira: {result.expires_at === "never" ? "Nunca" : result.expires_at}</p>
          <button
            onClick={() => { navigator.clipboard.writeText(result.key); alert("Copiado"); }}
            className="mt-3 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
          >
            Copiar
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-gray-900 rounded-xl p-4 border border-red-700">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </main>
  );
}
