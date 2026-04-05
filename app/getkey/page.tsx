"use client";

  import { useEffect, useState, useCallback } from "react";
  import { useSearchParams } from "next/navigation";
  import { Suspense } from "react";

  const DISCORD_INVITE = "https://discord.gg/B29pp4vm5G";
  const WORKINK_LINK = "https://work.ink/2tqZ/keyserver";

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
    active: boolean;
    expired: boolean;
    label: string | null;
    created_at: string;
    expires_at: string | null;
    last_used_at: string | null;
    time_left: string | null;
    ms_left: number | null;
  };

  function TimeBar({ msLeft, expiresAt }: { msLeft: number | null; expiresAt: string | null }) {
    const [remaining, setRemaining] = useState(msLeft ?? 0);

    useEffect(() => {
      if (!expiresAt) return;
      const interval = setInterval(() => {
        const left = new Date(expiresAt).getTime() - Date.now();
        setRemaining(left > 0 ? left : 0);
      }, 1000);
      return () => clearInterval(interval);
    }, [expiresAt]);

    if (!expiresAt) return null;

    const initial = msLeft ?? remaining;
    const pct = Math.max(0, Math.min(100, initial > 0 ? (remaining / initial) * 100 : 0));
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
            style={{ width: `${pct}%`, background: pct > 50 ? "#6366f1" : pct > 20 ? "#f59e0b" : "#ef4444" }}
          />
        </div>
      </div>
    );
  }

  function GetKeyContent() {
    const searchParams = useSearchParams();
    const workinkToken = searchParams.get("token");

    const [savedKey, setSavedKey] = useState<string | null>(null);
    const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [generatingKey, setGeneratingKey] = useState(false);
    const [newKey, setNewKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    const checkSavedKey = useCallback(async (key: string) => {
      setLoadingStatus(true);
      setError("");
      try {
        const res = await fetch("/api/keystatus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key }),
        });
        const data = await res.json();
        if (res.ok && data.found) {
          setKeyStatus(data);
        } else {
          localStorage.removeItem("h6rnyx_key");
          setSavedKey(null);
        }
      } catch {
        setError("Error de conexión.");
      } finally {
        setLoadingStatus(false);
      }
    }, []);

    const generateFromWorkink = useCallback(async (token: string) => {
      setGeneratingKey(true);
      setError("");
      try {
        const res = await fetch("/api/generatekey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workink_token: token }),
        });
        const data = await res.json();
        if (res.ok && data.key) {
          localStorage.setItem("h6rnyx_key", data.key);
          setSavedKey(data.key);
          setNewKey(data.key);
          await checkSavedKey(data.key);
        } else {
          setError(data.error || "Token inválido o ya utilizado.");
        }
      } catch {
        setError("Error de conexión.");
      } finally {
        setGeneratingKey(false);
      }
    }, [checkSavedKey]);

    useEffect(() => {
      const stored = localStorage.getItem("h6rnyx_key");
      if (workinkToken) {
        generateFromWorkink(workinkToken);
      } else if (stored) {
        setSavedKey(stored);
        checkSavedKey(stored);
      }
    }, [workinkToken, generateFromWorkink, checkSavedKey]);

    const copyKey = (key: string) => {
      navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const clearAndRenew = () => {
      localStorage.removeItem("h6rnyx_key");
      setSavedKey(null);
      setKeyStatus(null);
      setNewKey(null);
      setError("");
      window.location.href = WORKINK_LINK;
    };

    const isExpiredOrInactive = keyStatus && (!keyStatus.active || keyStatus.expired);
    const isActive = keyStatus && keyStatus.active && !keyStatus.expired;

    return (
      <main className="max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">H6rnyx KeyServer</h1>
          <p className="text-gray-500 text-sm mt-1">Anchored Alpha ESP</p>
        </div>

        {/* Loading state */}
        {(loadingStatus || generatingKey) && (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400 text-sm">
              {generatingKey ? "Generando tu key..." : "Verificando tu key..."}
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loadingStatus && !generatingKey && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-5 text-center mb-4">
            <p className="text-red-300 text-sm mb-3">{error}</p>
            <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <DiscordIcon /> Soporte en Discord
            </a>
          </div>
        )}

        {/* Active key */}
        {isActive && !loadingStatus && (
          <div className="bg-gray-900 rounded-xl p-6 border border-indigo-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-sm font-semibold">Key Activa</span>
              </div>
              {keyStatus.label && (
                <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full">{keyStatus.label}</span>
              )}
            </div>

            {newKey && (
              <div className="mb-4">
                <p className="text-gray-500 text-xs mb-2">Tu nueva key — guárdala</p>
                <div className="bg-gray-800 rounded-lg p-3 mb-2">
                  <code className="text-indigo-300 text-sm break-all">{newKey}</code>
                </div>
                <button onClick={() => copyKey(newKey)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  {copied ? "✓ Copiado" : "Copiar Key"}
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Último uso</p>
                <p className="text-white font-medium">{fmt(keyStatus.last_used_at)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Expira</p>
                <p className="text-white font-medium">
                  {keyStatus.expires_at ? fmt(keyStatus.expires_at) : "♾️ Lifetime"}
                </p>
              </div>
            </div>

            {keyStatus.expires_at
              ? <TimeBar msLeft={keyStatus.ms_left} expiresAt={keyStatus.expires_at} />
              : <p className="mt-4 text-indigo-300 text-sm text-center">♾️ Esta key no expira nunca</p>
            }

            <div className="mt-5 flex flex-col gap-2">
              <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <DiscordIcon /> Discord
              </a>
            </div>
          </div>
        )}

        {/* Expired / inactive key */}
        {isExpiredOrInactive && !loadingStatus && (
          <div className="bg-gray-900 rounded-xl p-6 border border-red-700">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="text-red-400 text-sm font-semibold">
                {keyStatus.expired ? "Key Expirada" : "Key Inactiva"}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-5">
              {keyStatus.expired
                ? "Tu key ha expirado. Obtén una nueva gratis completando los pasos de work.ink."
                : "Tu key fue desactivada. Contacta soporte si crees que es un error."}
            </p>
            <button onClick={clearAndRenew}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors mb-2">
              Obtener nueva key →
            </button>
            <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <DiscordIcon /> Soporte en Discord
            </a>
          </div>
        )}

        {/* No key saved */}
        {!savedKey && !loadingStatus && !generatingKey && !error && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
            <p className="text-gray-300 text-sm mb-2">No tienes ninguna key activa</p>
            <p className="text-gray-500 text-xs mb-6">Completa los pasos de work.ink para obtener una gratis</p>
            <a href={WORKINK_LINK} target="_blank" rel="noopener noreferrer"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm">
              Obtener Key →
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
  