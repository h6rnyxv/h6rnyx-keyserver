"use client";

import { useState } from "react";

const WORKINK_LINK = "https://work.ink/2tqZ/keyserver";
const DISCORD_INVITE = "https://discord.gg/B29pp4vm5G";

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

      <a
        href={DISCORD_INVITE}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white px-6 py-3 rounded-xl font-medium transition-colors w-full"
      >
        <svg width="20" height="16" viewBox="0 0 71 55" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M60.1 4.9A58.8 58.8 0 0 0 45.7.4a.2.2 0 0 0-.2.1 40.9 40.9 0 0 0-1.8 3.7 54.3 54.3 0 0 0-16.3 0A37.5 37.5 0 0 0 25.6.5a.2.2 0 0 0-.2-.1A58.6 58.6 0 0 0 11 4.9a.2.2 0 0 0-.1.1C1.6 18.7-1 32.2.3 45.5a.2.2 0 0 0 .1.2 59.1 59.1 0 0 0 17.8 9 .2.2 0 0 0 .2-.1 42.2 42.2 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.9 38.9 0 0 1-5.6-2.7.2.2 0 0 1 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 0 1 .2 0c11.7 5.4 24.4 5.4 36 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.8 36.8 0 0 1-5.6 2.7.2.2 0 0 0-.1.3 47.3 47.3 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.9 58.9 0 0 0 17.8-9 .2.2 0 0 0 .1-.2C73 30.1 70.2 16.7 60.2 5a.2.2 0 0 0-.1-.1ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z"/>
        </svg>
        Unirse al servidor de Discord
      </a>

      <p className="text-center text-gray-600 text-xs mt-8">
        API disponible en <code>/api/checkkey</code>
      </p>
    </main>
  );
}
