"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
            onClick={() => {
              navigator.clipboard.writeText(key);
              alert("Copiado al portapapeles");
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Copiar Key
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="bg-gray-900 rounded-xl p-8 border border-red-700">
          <div className="text-red-400 text-4xl mb-4">✗</div>
          <p className="text-red-300 font-semibold text-lg mb-2">Error</p>
          <p className="text-gray-400 text-sm">{message}</p>
          <a
            href="/"
            className="mt-6 inline-block bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
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
