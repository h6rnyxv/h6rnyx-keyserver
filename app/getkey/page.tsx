"use client";

  import { useEffect, useState, useCallback } from "react";
  import { useSearchParams } from "next/navigation";
  import { Suspense } from "react";

  const DISCORD_INVITE = "https://discord.gg/B29pp4vm5G";

  const DiscordIcon = () => (
    <svg width="18" height="14" viewBox="0 0 71 55" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M60.1 4.9A58.8 58.8 0 0 0 45.7.4a.2.2 0 0 0-.2.1 40.9 40.9 0 0 0-1.8 3.7 54.3 54.3 0 0 0-16.3 0A37.5 37.5 0 0 0 25.6.5a.2.2 0 0 0-.2-.1A58.6 58.6 0 0 0 11 4.9a.2.2 0 0 0-.1.1C1.6 18.7-1 32.2.3 45.5a.2.2 0 0 0 .1.2 59.1 59.1 0 0 0 17.8 9 .2.2 0 0 0 .2-.1 42.2 42.2 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.9 38.9 0 0 1-5.6-2.7.2.2 0 0 1 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 0 1 .2 0c11.7 5.4 24.4 5.4 36 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.8 36.8 0 0 1-5.6 2.7.2.2 0 0 0-.1.3 47.3 47.3 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.9 58.9 0 0 0 17.8-9 .2.2 0 0 0 .1-.2C73 30.1 70.2 16.7 60.2 5a.2.2 0 0 0-.1-.1ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z"/>
    </svg>
  );

  function fmt(date: string | null) {
    if (!date) return "—";
    return new Date(date).toLocaleString("es", { dateStyle: "short", timeStyle: "short" });
  }

  type KeyStatus = {
    found: boolean;
    active: boolean;
    expired: boolean;
    label: string | null;
    created_at: string;
    expires_at: string | null;
    last_used_at: string | null;
    roblox_username: string | null;
    time_left: string | null;
    ms_left: number | null;
  };

  function TimeBar({ msLeft, expiresAt }: { msLeft: number | null; expiresAt: string | null }) {
    const [remaining, setRemaining] = useState(msLeft);

    useEffect(() => {
      if (!msLeft || !expiresAt) return;
      const interval = setInterval(() => {
        const left = new Date(expiresAt).getTime() - Date.now();
        setRemaining(left > 0 ? left : 0);
      }, 1000);
      return () => clearInterval(interval);
    }, [msLeft, expiresAt]);

    if (!remaining || !expiresAt) return null;

    const pct = Math.max(0, Math.min(100, (remaining / ((msLeft ?? remaining) > 0 ? (msLeft ?? remaining) : 1)) * 100));

    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const mins = Math.floor((remaining % 3600000) / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);

    const label = days > 0 ? `${days}d ${hours}h ${mins}m` : hours > 0 ? `${hours}h ${mins}m ${secs}s` : `${mins}m ${secs}s`;

    return (
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Tiempo restante</span>
          <span className="font-mono text-indigo-300">{label}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-1000"
            style={{
              width: `${pct}%`,
              background: pct > 50 ? "#6366f1" : pct > 20 ? "#f59e0b" : "#ef4444"
            }}
          />
        </div>
      </div>
    );
  }

  function CheckKeyTab() {
    const [keyInput, setKeyInput] = useState("");
    const [status, setStatus] = useState<KeyStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const check = useCallback(async () => {
      if (!keyInput.trim()) return;
      setLoading(true);
      setError("");
      setStatus(null);
      try {
        const res = await fetch("/api/keystatus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: keyInput.trim() }),
        });
        const data = await res.json();
        if (!res.ok || !data.found) {
          setError(data.message || "Key no encontrada.");
        } else {
          setStatus(data);
        }
      } catch {
        setError("Error de conexión.");
      } finally {
        setLoading(false);
      }
    }, [keyInput]);

    const copyKey = () => {
      navigator.clipboard.writeText(keyInput.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && check()}
            placeholder="Pega tu key aquí..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={check}
            disabled={loading || !keyInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "..." : "Verificar"}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
            ✗ {error}
          </div>
        )}

        {status && (
          <div className={`rounded-xl p-5 border ${status.active ? "bg-gray-900 border-indigo-700" : "bg-gray-900 border-red-700"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${status.active ? "bg-green-400" : "bg-red-400"}`} />
                <span className={`text-sm font-semibold ${status.active ? "text-green-400" : "text-red-400"}`}>
                  {status.active ? "Key Activa" : status.expired ? "Key Expirada" : "Key Inactiva"}
                </span>
              </div>
              {status.label && (
                <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full">{status.label}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Último uso</p>
                <p className="text-white font-medium">{fmt(status.last_used_at)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Creada</p>
                <p className="text-white font-medium">{fmt(status.created_at)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Expira</p>
                <p className="text-white font-medium">
                  {status.expires_at ? fmt(status.expires_at) : "♾️ Lifetime"}
                </p>
              </div>
            </div>

            {status.active && status.expires_at && (
              <TimeBar msLeft={status.ms_left} expiresAt={status.expires_at} />
            )}

            {status.active && !status.expires_at && (
              <div className="mt-4 flex items-center gap-2 text-indigo-300 text-sm">
                <span>♾️</span>
                <span>Esta key no expira nunca</span>
              </div>
            )}

            <button
              onClick={copyKey}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
            >
              {copied ? "✓ Copiado" : "Copiar Key"}
            </button>
          </div>
        )}
      </div>
    );
  }

  function GetKeyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [tab, setTab] = useState<"get" | "check">(token ? "get" : "check");
    const [getStatus, setGetStatus] = useState<"idle" | "loading" | "success" | "error">(token ? "loading" : "idle");
    const [key, setKey] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
      if (!token) return;
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
            setGetStatus("success");
          } else {
            setGetStatus("error");
            setMessage(data.error || "Token inválido o ya utilizado.");
          }
        } catch {
          setGetStatus("error");
          setMessage("Error de conexión. Intenta de nuevo.");
        }
      };
      validate();
    }, [token]);

    const copyKey = (k: string) => {
      navigator.clipboard.writeText(k);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <main className="max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">H6rnyx KeyServer</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de keys para Anchored Alpha ESP</p>
        </div>

        <div className="flex gap-2 mb-6">
          {([["get", "🔑 Obtener Key"], ["check", "🔍 Ver mi Key"]] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "get" && (
          <div>
            {getStatus === "idle" && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <p className="text-gray-300 text-sm mb-2">Para obtener una key, completa los pasos en work.ink</p>
                <p className="text-gray-500 text-xs mb-5">Después serás redirigido aquí automáticamente con tu key</p>
                <a
                  href="https://work.ink/2tqZ/keyserver"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Obtener Key →
                </a>
              </div>
            )}

            {getStatus === "loading" && (
              <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Validando tu token con work.ink...</p>
              </div>
            )}

            {getStatus === "success" && key && (
              <div className="bg-gray-900 rounded-xl p-6 border border-green-700">
                <div className="text-center mb-5">
                  <div className="text-green-400 text-4xl mb-2">✓</div>
                  <p className="text-green-300 font-semibold text-lg">Key generada exitosamente</p>
                  <p className="text-gray-500 text-xs mt-1">Guárdala ahora, no se mostrará de nuevo</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <code className="text-indigo-300 text-sm break-all">{key}</code>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => copyKey(key)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    {copied ? "✓ Copiado" : "Copiar Key"}
                  </button>
                  <a
                    href={DISCORD_INVITE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    <DiscordIcon /> Unirse al Discord
                  </a>
                </div>
              </div>
            )}

            {getStatus === "error" && (
              <div className="bg-gray-900 rounded-xl p-6 border border-red-700 text-center">
                <div className="text-red-400 text-4xl mb-2">✗</div>
                <p className="text-red-300 font-semibold mb-2">Error</p>
                <p className="text-gray-400 text-sm mb-5">{message}</p>
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm mb-3"
                >
                  <DiscordIcon /> Soporte en Discord
                </a>
                <a href="/getkey" className="inline-block text-gray-500 hover:text-gray-400 text-sm transition-colors">
                  Intentar de nuevo
                </a>
              </div>
            )}
          </div>
        )}

        {tab === "check" && <CheckKeyTab />}
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
  