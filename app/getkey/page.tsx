"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const DISCORD_INVITE = "https://discord.gg/aERxwdSGxz";
const WORKINK_LINK = "https://work.ink/2tqZ/keyserver";

const DiscordIcon = () => (
  <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M60.1 4.9A58.8 58.8 0 0 0 45.7.4a.2.2 0 0 0-.2.1 40.9 40.9 0 0 0-1.8 3.7 54.3 54.3 0 0 0-16.3 0A37.5 37.5 0 0 0 25.6.5a.2.2 0 0 0-.2-.1A58.6 58.6 0 0 0 11 4.9a.2.2 0 0 0-.1.1C1.6 18.7-1 32.2.3 45.5a.2.2 0 0 0 .1.2 59.1 59.1 0 0 0 17.8 9 .2.2 0 0 0 .2-.1 42.2 42.2 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.9 38.9 0 0 1-5.6-2.7.2.2 0 0 1 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 0 1 .2 0c11.7 5.4 24.4 5.4 36 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.8 36.8 0 0 1-5.6 2.7.2.2 0 0 0-.1.3 47.3 47.3 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.9 58.9 0 0 0 17.8-9 .2.2 0 0 0 .1-.2C73 30.1 70.2 16.7 60.2 5a.2.2 0 0 0-.1-.1ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 7H9M15 7C16.6569 7 18 8.34315 18 10V17C18 18.6569 16.6569 20 15 20H9C7.34315 20 6 18.6569 6 17V10C6 8.34315 7.34315 7 9 7M15 7V5C15 3.89543 14.1046 3 13 3H11C9.89543 3 9 3.89543 9 5V7M12 12V16M12 12C12.5523 12 13 11.5523 13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11C11 11.5523 11.4477 12 12 12Z" stroke="url(#kg2)" strokeWidth="1.5" strokeLinecap="round"/>
    <defs>
      <linearGradient id="kg2" x1="6" y1="3" x2="18" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a855f7"/>
        <stop offset="1" stopColor="#ec4899"/>
      </linearGradient>
    </defs>
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
  const label =
    days > 0 ? `${days}d ${hours}h ${mins}m` :
    hours > 0 ? `${hours}h ${mins}m ${secs}s` :
    `${mins}m ${secs}s`;

  const barColor =
    pct > 50 ? "linear-gradient(90deg, #7c3aed, #a855f7)" :
    pct > 20 ? "linear-gradient(90deg, #d97706, #f59e0b)" :
    "linear-gradient(90deg, #dc2626, #ef4444)";

  return (
    <div className="mt-5">
      <div className="flex justify-between text-xs mb-2">
        <span className="text-zinc-500">Tiempo restante</span>
        <span className="font-mono" style={{color: "#c084fc"}}>{label}</span>
      </div>
      <div className="w-full rounded-full h-1.5" style={{background: "rgba(255,255,255,0.07)"}}>
        <div
          className="h-1.5 rounded-full transition-all duration-1000"
          style={{width: `${pct}%`, background: barColor}}
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
  const isLoading = loadingStatus || generatingKey;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background effects matching main page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.18),transparent)] pointer-events-none" />
      <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-purple-700/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-pink-900/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(236,72,153,0.08) 100%)", border: "1px solid rgba(139,92,246,0.25)", boxShadow: "0 0 30px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.05)"}}>
            <KeyIcon />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-1.5">
            <span style={{background: "linear-gradient(135deg, #fff 0%, #e9d5ff 40%, #a855f7 70%, #ec4899 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}}>
              H6rnyx
            </span>{" "}
            <span className="text-white">KeyServer</span>
          </h1>
          <p style={{background: "linear-gradient(90deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}} className="text-sm font-medium">
            Estado de tu key
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="rounded-2xl p-8 text-center"
            style={{background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.2)", backdropFilter: "blur(12px)"}}>
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
              style={{borderColor: "rgba(168,85,247,0.6)", borderTopColor: "transparent"}} />
            <p className="text-zinc-400 text-sm">
              {generatingKey ? "Generando tu key..." : "Verificando tu key..."}
            </p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="rounded-2xl p-5 text-center mb-4"
            style={{background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", backdropFilter: "blur(12px)"}}>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm active:scale-[0.98]"
              style={{background: "linear-gradient(135deg, #7c3aed, #9333ea)", boxShadow: "0 4px 20px rgba(124,58,237,0.35)"}}>
              <DiscordIcon /> Soporte en Discord
            </a>
          </div>
        )}

        {/* Active key */}
        {isActive && !isLoading && (
          <div className="rounded-2xl p-6"
            style={{background: "rgba(255,255,255,0.02)", border: "1px solid rgba(52,211,153,0.3)", backdropFilter: "blur(12px)"}}>
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{background: "radial-gradient(ellipse at top left, rgba(52,211,153,0.04) 0%, transparent 70%)"}} />

            {/* Status badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold" style={{color: "#34d399"}}>Key Activa</span>
              </div>
              {keyStatus.label && (
                <span className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#c084fc"}}>
                  {keyStatus.label}
                </span>
              )}
            </div>

            {/* New key display */}
            {newKey && (
              <div className="mb-5">
                <p className="text-zinc-500 text-xs mb-2">Tu nueva key — guárdala</p>
                <div className="rounded-xl px-4 py-3 mb-3"
                  style={{background: "rgba(0,0,0,0.4)", border: "1px solid rgba(139,92,246,0.2)"}}>
                  <code className="text-sm break-all font-mono" style={{color: "#d8b4fe"}}>{newKey}</code>
                </div>
                <button
                  onClick={() => copyKey(newKey)}
                  className="w-full py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm text-white active:scale-[0.98]"
                  style={copied
                    ? {background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399"}
                    : {background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)", boxShadow: "0 4px 20px rgba(139,92,246,0.35)"}}>
                  {copied ? "✓ Copiado" : "Copiar Key"}
                </button>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl px-4 py-3"
                style={{background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)"}}>
                <p className="text-zinc-500 text-xs mb-1">Último uso</p>
                <p className="text-white font-medium text-sm">{fmt(keyStatus.last_used_at)}</p>
              </div>
              <div className="rounded-xl px-4 py-3"
                style={{background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)"}}>
                <p className="text-zinc-500 text-xs mb-1">Expira</p>
                <p className="text-white font-medium text-sm">
                  {keyStatus.expires_at ? fmt(keyStatus.expires_at) : "♾️ Lifetime"}
                </p>
              </div>
            </div>

            {/* Time bar or lifetime message */}
            {keyStatus.expires_at
              ? <TimeBar msLeft={keyStatus.ms_left} expiresAt={keyStatus.expires_at} />
              : (
                <p className="mt-4 text-sm text-center" style={{color: "#c084fc"}}>
                  ♾️ Esta key no expira nunca
                </p>
              )
            }

            {/* Discord button */}
            <div className="mt-5">
              <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm w-full active:scale-[0.98]"
                style={{background: "linear-gradient(135deg, #7c3aed, #9333ea)", boxShadow: "0 4px 20px rgba(124,58,237,0.35)"}}>
                <DiscordIcon /> Discord
              </a>
            </div>
          </div>
        )}

        {/* Expired / Inactive key */}
        {isExpiredOrInactive && !isLoading && (
          <div className="rounded-2xl p-6"
            style={{background: "rgba(255,255,255,0.02)", border: "1px solid rgba(239,68,68,0.3)", backdropFilter: "blur(12px)"}}>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-sm font-semibold text-red-400">
                {keyStatus.expired ? "Key Expirada" : "Key Inactiva"}
              </span>
            </div>
            <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
              {keyStatus.expired
                ? "Tu key ha expirado. Obtén una nueva gratis completando los pasos de work.ink."
                : "Tu key fue desactivada. Contacta soporte si crees que es un error."}
            </p>
            <div className="space-y-3">
              <button
                onClick={clearAndRenew}
                className="w-full py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm text-white active:scale-[0.98]"
                style={{background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)", boxShadow: "0 4px 20px rgba(139,92,246,0.35)"}}>
                Obtener nueva key →
              </button>
              <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm w-full active:scale-[0.98]"
                style={{background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", color: "#c084fc"}}>
                <DiscordIcon /> Soporte en Discord
              </a>
            </div>
          </div>
        )}

        {/* No key saved */}
        {!savedKey && !isLoading && !error && (
          <div className="rounded-2xl p-6 text-center"
            style={{background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.2)", backdropFilter: "blur(12px)"}}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5"/>
                <path d="M12 8v5M12 16v.5" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-white text-sm font-semibold mb-1">No tienes ninguna key activa</p>
            <p className="text-zinc-500 text-xs mb-6 leading-relaxed">Completa los pasos de work.ink para obtener una gratis</p>
            <a href="/"
              className="inline-flex items-center justify-center gap-2 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm active:scale-[0.98]"
              style={{background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)", boxShadow: "0 4px 20px rgba(139,92,246,0.35)"}}>
              Obtener Key →
            </a>
          </div>
        )}

        {/* Back link */}
        <p className="text-center text-zinc-600 text-xs mt-8">
          <a href="/"
            style={{background: "linear-gradient(90deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}}
            className="font-semibold hover:opacity-80 transition-opacity">
            ← Volver al inicio
          </a>
        </p>
      </div>
    </main>
  );
}

export default function GetKeyPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.18),transparent)] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{borderColor: "rgba(168,85,247,0.6)", borderTopColor: "transparent"}} />
          <p className="text-zinc-500 text-sm">Cargando...</p>
        </div>
      </main>
    }>
      <GetKeyContent />
    </Suspense>
  );
}
