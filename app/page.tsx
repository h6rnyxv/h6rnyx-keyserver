"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const DISCORD_INVITE = "https://discord.gg/aERxwdSGxz";
const WORKINK_LINK  = "https://work.ink/2tqZ/keyserver";

const DiscordIcon = () => (
  <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M60.1 4.9A58.8 58.8 0 0 0 45.7.4a.2.2 0 0 0-.2.1 40.9 40.9 0 0 0-1.8 3.7 54.3 54.3 0 0 0-16.3 0A37.5 37.5 0 0 0 25.6.5a.2.2 0 0 0-.2-.1A58.6 58.6 0 0 0 11 4.9a.2.2 0 0 0-.1.1C1.6 18.7-1 32.2.3 45.5a.2.2 0 0 0 .1.2 59.1 59.1 0 0 0 17.8 9 .2.2 0 0 0 .2-.1 42.2 42.2 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.9 38.9 0 0 1-5.6-2.7.2.2 0 0 1 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 0 1 .2 0c11.7 5.4 24.4 5.4 36 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.8 36.8 0 0 1-5.6 2.7.2.2 0 0 0-.1.3 47.3 47.3 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.9 58.9 0 0 0 17.8-9 .2.2 0 0 0 .1-.2C73 30.1 70.2 16.7 60.2 5a.2.2 0 0 0-.1-.1ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 7H9M15 7C16.6569 7 18 8.34315 18 10V17C18 18.6569 16.6569 20 15 20H9C7.34315 20 6 18.6569 6 17V10C6 8.34315 7.34315 7 9 7M15 7V5C15 3.89543 14.1046 3 13 3H11C9.89543 3 9 3.89543 9 5V7M12 12V16M12 12C12.5523 12 13 11.5523 13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11C11 11.5523 11.4477 12 12 12Z" stroke="url(#kg)" strokeWidth="1.5" strokeLinecap="round"/>
    <defs>
      <linearGradient id="kg" x1="6" y1="3" x2="18" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a855f7"/>
        <stop offset="1" stopColor="#ec4899"/>
      </linearGradient>
    </defs>
  </svg>
);

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [discordVerified, setDiscordVerified] = useState(false);
  const [checkingVerify, setCheckingVerify] = useState(true);
  const [error, setError] = useState("");
  const [isEs, setIsEs] = useState(true);
  useEffect(() => { setIsEs(!navigator.language.toLowerCase().startsWith("en")); }, []);

  const checkDiscordCookie = useCallback(async () => {
    try {
      const res = await fetch("/api/discord/verify", { method: "POST" });
      const data = await res.json();
      setDiscordVerified(data.verified === true);
    } catch {
      setDiscordVerified(false);
    } finally {
      setCheckingVerify(false);
    }
  }, []);

  useEffect(() => {
    const verified = searchParams.get("verified");
    const err = searchParams.get("error");
    if (err === "token_invalid") setError(isEs ? "❌ El link expiró o ya fue usado. Usa !verify de nuevo en Discord." : "❌ The link expired or was already used. Run !verify again in Discord.");
    if (err === "token_missing") setError(isEs ? "❌ Link inválido. Usa !verify en el servidor de Discord." : "❌ Invalid link. Use !verify in the Discord server.");
    if (verified === "1") router.replace("/");
    checkDiscordCookie();
  }, [searchParams, checkDiscordCookie, router, isEs]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.18),transparent)] pointer-events-none" />
      <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-purple-700/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-pink-900/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
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
            {isEs ? "Obtén tu key aquí" : "Get your key here"}
          </p>
        </div>

        {error && (
          <div className="rounded-2xl p-4 text-center mb-5" style={{background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)"}}>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {/* Step 1 */}
          <div className="relative rounded-2xl p-5 transition-all duration-300 group"
            style={{background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.2)", backdropFilter: "blur(12px)"}}>
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{background: "radial-gradient(ellipse at top left, rgba(139,92,246,0.06) 0%, transparent 70%)"}} />
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 text-purple-300"
                style={{background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)"}}>
                1
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{isEs ? "Únete al servidor de Discord" : "Join the Discord server"}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{isEs ? "Necesitas estar en el servidor para continuar" : "You need to be in the server to continue"}</p>
              </div>
            </div>
            <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm w-full active:scale-[0.98]"
              style={{background: "linear-gradient(135deg, #7c3aed, #9333ea)", boxShadow: "0 4px 20px rgba(124,58,237,0.35)"}}>
              <DiscordIcon />
              {isEs ? "Unirse al Discord" : "Join Discord"}
            </a>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-2xl p-5 transition-all duration-300 group"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: discordVerified ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(139,92,246,0.2)",
              backdropFilter: "blur(12px)"
            }}>
            {discordVerified && (
              <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{background: "radial-gradient(ellipse at top left, rgba(52,211,153,0.05) 0%, transparent 70%)"}} />
            )}
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all"
                style={discordVerified
                  ? {background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399"}
                  : {background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", color: "#c084fc"}}>
                {discordVerified ? "✓" : "2"}
              </div>
              <div>
                <p className="font-semibold text-sm" style={discordVerified ? {color: "#34d399"} : {color: "#fff"}}>
                  {discordVerified
                    ? (isEs ? "Discord verificado" : "Discord verified")
                    : (isEs ? "Verifica que estás en el servidor" : "Verify you're in the server")}
                </p>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {discordVerified
                    ? (isEs ? "El bot confirmó tu membresía" : "Bot confirmed your membership")
                    : (isEs ? "Escribe !verify en cualquier canal" : "Type !verify in any channel")}
                </p>
              </div>
            </div>
            {!discordVerified && (
              <div className="rounded-xl px-4 py-3 text-center" style={{background: "rgba(0,0,0,0.4)", border: "1px solid rgba(139,92,246,0.15)"}}>
                {checkingVerify ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor: "rgba(168,85,247,0.6)", borderTopColor: "transparent"}} />
                    <p className="text-zinc-500 text-xs">Verificando...</p>
                  </div>
                ) : (
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    {isEs ? "En el servidor, escribe" : "In the server, type"}{" "}
                    <code className="font-mono text-xs px-1.5 py-0.5 rounded-md" style={{background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", color: "#d8b4fe"}}>!verify</code>{" "}
                    {isEs ? "y sigue el link que te envía el bot." : "and follow the link the bot sends."}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Step 3 */}
          <div className={`relative rounded-2xl p-5 transition-all duration-300 group ${!discordVerified ? "opacity-40" : ""}`}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: discordVerified ? "1px solid rgba(139,92,246,0.35)" : "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)"
            }}>
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{background: "radial-gradient(ellipse at top right, rgba(168,85,247,0.06) 0%, transparent 70%)"}} />
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                style={discordVerified
                  ? {background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", color: "#c084fc"}
                  : {background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#52525b"}}>
                3
              </div>
              <div>
                <p className={`font-semibold text-sm ${discordVerified ? "text-white" : "text-zinc-600"}`}>
                  {isEs ? "Obtén tu key en work.ink" : "Get your key on work.ink"}
                </p>
                <p className="text-zinc-600 text-xs mt-0.5">{isEs ? "Completa los pasos y recibe tu key" : "Complete the steps and get your key"}</p>
              </div>
            </div>
            <a
              href={discordVerified ? WORKINK_LINK : undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => { if (!discordVerified) e.preventDefault(); }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm w-full active:scale-[0.98]"
              style={discordVerified
                ? {background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)", boxShadow: "0 4px 20px rgba(139,92,246,0.35)", color: "#fff"}
                : {background: "rgba(255,255,255,0.04)", color: "#52525b", cursor: "not-allowed"}}>
              {discordVerified ? (isEs ? "Obtener Key →" : "Get Key →") : (isEs ? "Completa los pasos anteriores" : "Complete previous steps")}
            </a>
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-8">
          {isEs ? "¿Ya tienes una key?" : "Already have a key?"}{" "}
          <a href="/getkey" style={{background: "linear-gradient(90deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}}
            className="font-semibold hover:opacity-80 transition-opacity">
            {isEs ? "Ver estado →" : "Check status →"}
          </a>
        </p>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
