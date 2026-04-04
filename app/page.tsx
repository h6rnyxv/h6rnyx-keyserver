"use client";

import { useState } from "react";

const WORKINK_LINK = "https://work.ink/2tqZ/keyserver";

export default function Home() {
  const [keyToCheck, setKeyToCheck] = useState("");
  const [checkResult, setCheckResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [checking, setChecking] = useState(false);

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
      <p className="text-gray-400 mb-10">Obtén tu API Key completando los pasos de verificación</p>

      <section className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
        <h2 className="text-lg font-semibold mb-2 text-white">Obtener una Key</h2>
        <p className="text-gray-400 text-sm mb-5">
          Para obtener una key gratuita, completa los pasos de verificación. Solo toma 1 minuto.
        </p>
        <a
          href={WORKINK_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center w-full"
        >
          Obtener Key gratis →
        </a>
        <p className="text-gray-600 text-xs mt-3 text-center">
          Serás redirigido a work.ink para completar la verificación
        </p>
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
        API disponible en <code>/api/checkkey</code>
      </p>
    </main>
  );
}
