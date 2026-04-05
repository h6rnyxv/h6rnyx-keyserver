"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const DISCORD_INVITE = process.env.NEXT_PUBLIC_DISCORD_INVITE || "https://discord.gg/tu-servidor";

function GetKeyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [key, setKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No se encontró el token. Asegúrate de haber completado los pasos en work.ink.");
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch("/api/generatekey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workink_token: token }),
        });
        const data = await res.json();
        if (res.ok && data.key) {
          setKey(data.key);
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(data.error || "Token inválido o ya utilizado.");
        }
      } catch {
        setStatus("error");
        setMessage("Error de conexión. Intenta de nuevo.");
      }
    };

    validate();
  }, [token]);

  return (
    <main className="max-w-lg mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-8 text-white">H6rnyx KeyServer</h1>

      {status === "loading" && (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Validando tu token con work.ink...</p>
        </div>
      )}

      {status === "success" && key && (
        <div className="bg-gray-900 rounded-xl p-8 border border-green-700">
          <div className="text-green-400 text-4xl mb-4">✓</div>
          <p className="text-green-300 font-semibold text-lg mb-2">Key generada exitosamente</p>
          <p className="text-gray-400 text-sm mb-6">Guárdala ahora — no se mostrará de nuevo.</p>
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <code className="text-indigo-300 text-sm break-all">{key}</code>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(key); alert("Copiado al portapapeles"); }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors mb-3"
          >
            Copiar Key
          </button>
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <svg width="18" height="14" viewBox="0 0 71 55" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M60.1 4.9A58.8 58.8 0 0 0 45.7.4a.2.2 0 0 0-.2.1 40.9 40.9 0 0 0-1.8 3.7 54.3 54.3 0 0 0-16.3 0A37.5 37.5 0 0 0 25.6.5a.2.2 0 0 0-.2-.1A58.6 58.6 0 0 0 11 4.9a.2.2 0 0 0-.1.1C1.6 18.7-1 32.2.3 45.5a.2.2 0 0 0 .1.2 59.1 59.1 0 0 0 17.8 9 .2.2 0 0 0 .2-.1 42.2 42.2 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.9 38.9 0 0 1-5.6-2.7.2.2 0 0 1 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 0 1 .2 0c11.7 5.4 24.4 5.4 36 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.8 36.8 0 0 1-5.6 2.7.2.2 0 0 0-.1.3 47.3 47.3 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.9 58.9 0 0 0 17.8-9 .2.2 0 0 0 .1-.2C73 30.1 70.2 16.7 60.2 5a.2.2 0 0 0-.1-.1ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z"/>
            </svg>
            Unirse al servidor de Discord
          </a>
        </div>
      )}

      {status === "error" && (
        <div className="bg-gray-900 rounded-xl p-8 border border-red-700">
          <div className="text-red-400 text-4xl mb-4">✗</div>
          <p className="text-red-300 font-semibold text-lg mb-2">Error</p>
          <p className="text-gray-400 text-sm mb-6">{message}</p>
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white px-6 py-2 rounded-lg font-medium transition-colors mb-3"
          >
            <svg width="18" height="14" viewBox="0 0 71 55" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M60.1 4.9A58.8 58.8 0 0 0 45.7.4a.2.2 0 0 0-.2.1 40.9 40.9 0 0 0-1.8 3.7 54.3 54.3 0 0 0-16.3 0A37.5 37.5 0 0 0 25.6.5a.2.2 0 0 0-.2-.1A58.6 58.6 0 0 0 11 4.9a.2.2 0 0 0-.1.1C1.6 18.7-1 32.2.3 45.5a.2.2 0 0 0 .1.2 59.1 59.1 0 0 0 17.8 9 .2.2 0 0 0 .2-.1 42.2 42.2 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.9 38.9 0 0 1-5.6-2.7.2.2 0 0 1 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 0 1 .2 0c11.7 5.4 24.4 5.4 36 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.8 36.8 0 0 1-5.6 2.7.2.2 0 0 0-.1.3 47.3 47.3 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.9 58.9 0 0 0 17.8-9 .2.2 0 0 0 .1-.2C73 30.1 70.2 16.7 60.2 5a.2.2 0 0 0-.1-.1ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z"/>
            </svg>
            Unirse al servidor de Discord
          </a>
          <a href="/" className="inline-block text-gray-500 hover:text-gray-400 text-sm transition-colors">
            Volver al inicio
          </a>
        </div>
      )}
    </main>
  );
}

export default function GetKeyPage() {
  return (
    <Suspense fallback={
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
      </main>
    }>
      <GetKeyContent />
    </Suspense>
  );
}
