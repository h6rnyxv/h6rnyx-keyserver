"use client";

import { useState } from "react";

export default function Home() {
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyToCheck, setKeyToCheck] = useState("");
  const [checkResult, setCheckResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedKey(null);
    try {
      const res = await fetch("/api/generatekey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedKey(data.key);
      } else {
        alert(data.error || "Error al generar la key");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    if (!keyToCheck.trim()) return;
    setChecking(true);
    setCheckResult(null);
    try {
      const res = await fetch("/api/checkkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyToCheck }),
      });
      const data = await res.json();
      setCheckResult({ valid: res.ok && data.valid, message: data.message });
    } catch {
      setCheckResult({ valid: false, message: "Error de conexión" });
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2 text-white">H6rnyx KeyServer</h1>
      <p className="text-gray-400 mb-10">Sistema de gestión de API Keys con Supabase</p>

      <section className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
        <h2 className="text-lg font-semibold mb-4 text-white">Generar nueva Key</h2>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Etiqueta (opcional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? "Generando..." : "Generar"}
          </button>
        </div>
        {generatedKey && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-indigo-500">
            <p className="text-xs text-gray-400 mb-1">Key generada — guárdala, no se mostrará de nuevo:</p>
            <code className="text-indigo-300 text-sm break-all">{generatedKey}</code>
            <button
              onClick={() => navigator.clipboard.writeText(generatedKey)}
              className="mt-2 text-xs text-gray-400 hover:text-white transition-colors block"
            >
              Copiar al portapapeles
            </button>
          </div>
        )}
      </section>

      <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold mb-4 text-white">Verificar Key</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Pega tu API key aquí"
            value={keyToCheck}
            onChange={(e) => setKeyToCheck(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          />
          <button
            onClick={handleCheck}
            disabled={checking}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium transition-colors"
          >
            {checking ? "Verificando..." : "Verificar"}
          </button>
        </div>
        {checkResult && (
          <div
            className={`mt-4 p-4 rounded-lg border ${
              checkResult.valid
                ? "bg-green-900/30 border-green-700 text-green-300"
                : "bg-red-900/30 border-red-700 text-red-300"
            }`}
          >
            <span className="font-medium">{checkResult.valid ? "✓ Válida" : "✗ Inválida"}</span>
            <span className="ml-2 text-sm">{checkResult.message}</span>
          </div>
        )}
      </section>

      <p className="text-center text-gray-600 text-xs mt-10">
        API disponible en <code>/api/generatekey</code> y <code>/api/checkkey</code>
      </p>
    </main>
  );
}
