"use client";

  import { useState, useEffect, useCallback, Suspense } from "react";
  import { useSearchParams, useRouter } from "next/navigation";

  const DISCORD_INVITE = "https://discord.gg/B29pp4vm5G";
  const WORKINK_LINK  = "https://work.ink/2tqZ/keyserver";

  const DiscordIcon = () => (
    <svg width="20" height="16" viewBox="0 0 71 55" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M60.1 4.9A58.8 58.8 0 0 0 45.7.4a.2.2 0 0 0-.2.1 40.9 40.9 0 0 0-1.8 3.7 54.3 54.3 0 0 0-16.3 0A37.5 37.5 0 0 0 25.6.5a.2.2 0 0 0-.2-.1A58.6 58.6 0 0 0 11 4.9a.2.2 0 0 0-.1.1C1.6 18.7-1 32.2.3 45.5a.2.2 0 0 0 .1.2 59.1 59.1 0 0 0 17.8 9 .2.2 0 0 0 .2-.1 42.2 42.2 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.9 38.9 0 0 1-5.6-2.7.2.2 0 0 1 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 0 1 .2 0c11.7 5.4 24.4 5.4 36 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.8 36.8 0 0 1-5.6 2.7.2.2 0 0 0-.1.3 47.3 47.3 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.9 58.9 0 0 0 17.8-9 .2.2 0 0 0 .1-.2C73 30.1 70.2 16.7 60.2 5a.2.2 0 0 0-.1-.1ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z"/>
    </svg>
  );

  function HomeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [discordVerified, setDiscordVerified] = useState(false);
    const [checkingVerify, setCheckingVerify] = useState(true);
    const [error, setError] = useState("");

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

      if (err === "token_invalid") setError("❌ El link expiró o ya fue usado. Corre /verificar de nuevo en Discord.");
      if (err === "token_missing") setError("❌ Link inválido. Usa /verificar en el servidor de Discord.");

      if (verified === "1") {
        // Viene de redireccion post-verificacion, limpiar URL
        router.replace("/");
      }

      checkDiscordCookie();
    }, [searchParams, checkDiscordCookie, router]);

    return (
      <main className="max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white">H6rnyx KeyServer</h1>
          <p className="text-gray-500 text-sm mt-1">Anchored Alpha ESP — Obtén tu key gratis</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-center mb-5">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">

          {/* Paso 1: Unirse al Discord */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-indigo-600 text-white">
                1
              </div>
              <div>
                <p className="text-white font-medium text-sm">Únete al servidor de Discord</p>
                <p className="text-gray-500 text-xs">Necesitas estar en el servidor para continuar</p>
              </div>
            </div>
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm w-full"
            >
              <DiscordIcon />
              Unirse al Discord
            </a>
          </div>

          {/* Paso 2: Verificar con el bot */}
          <div className={`bg-gray-900 rounded-xl p-5 border transition-all ${discordVerified ? "border-green-700" : "border-gray-800"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${discordVerified ? "bg-green-500 text-white" : "bg-indigo-600 text-white"}`}>
                {discordVerified ? "✓" : "2"}
              </div>
              <div>
                <p className={`font-medium text-sm ${discordVerified ? "text-green-400" : "text-white"}`}>
                  {discordVerified ? "Discord verificado ✓" : "Verifica que estás en el servidor"}
                </p>
                <p className="text-gray-500 text-xs">
                  {discordVerified
                    ? "El bot confirmó tu membresía"
                    : "Escribe /verificar en cualquier canal del servidor"}
                </p>
              </div>
            </div>
            {!discordVerified && (
              <div className="bg-gray-800 rounded-lg px-4 py-3 text-center">
                {checkingVerify ? (
                  <p className="text-gray-400 text-xs">Verificando...</p>
                ) : (
                  <p className="text-gray-400 text-xs leading-relaxed">
                    En el servidor de Discord, escribe el comando{" "}
                    <code className="bg-gray-700 text-indigo-300 px-1 py-0.5 rounded text-xs">/verificar</code>{" "}
                    y haz clic en el link que te manda el bot.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Paso 3: Obtener key en work.ink */}
          <div className={`bg-gray-900 rounded-xl p-5 border transition-all ${!discordVerified ? "opacity-50 border-gray-800" : "border-indigo-700"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${discordVerified ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-400"}`}>
                3
              </div>
              <div>
                <p className={`font-medium text-sm ${discordVerified ? "text-white" : "text-gray-500"}`}>
                  Obtén tu key en work.ink
                </p>
                <p className="text-gray-500 text-xs">Completa los pasos y recibirás tu key automáticamente</p>
              </div>
            </div>
            <a
              href={discordVerified ? WORKINK_LINK : undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => { if (!discordVerified) e.preventDefault(); }}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm w-full ${
                discordVerified
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              {discordVerified ? "Obtener Key →" : "Completa los pasos 1 y 2 primero"}
            </a>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-8">
          ¿Ya tienes una key? <a href="/getkey" className="text-indigo-400 hover:text-indigo-300 transition-colors">Ver estado de tu key</a>
        </p>
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
  