import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function parseDurationMs(d: string): number | null {
  if (!d || d === "lifetime") return null;
  const match = d.match(/^(\d+)(h|d|m)$/);
  if (!match) return null;
  const amount = parseInt(match[1]);
  const unit = match[2];
  if (unit === "h") return amount * 3_600_000;
  if (unit === "d") return amount * 86_400_000;
  if (unit === "m") return amount * 60_000;
  return null;
}

// GET — devuelve la duración actual configurada
export async function GET(req: NextRequest) {
  const key = req.headers.get("x-admin-key");
  if (!key || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { data } = await supabaseAdmin
      .from("hub_config")
      .select("value")
      .eq("key", "default_key_duration")
      .single();
    return NextResponse.json({ duration: data?.value ?? "2h" });
  } catch {
    return NextResponse.json({ duration: "2h" });
  }
}

// POST — guarda nueva duración y actualiza keys activas
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.admin_key || body.admin_key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const duration: string = (body.duration ?? "2h").trim();

    if (duration !== "lifetime" && !/^\d+(h|d|m)$/.test(duration)) {
      return NextResponse.json(
        { error: "Formato inválido. Usa: 1h, 5h, 24h, 7d, 30d o lifetime" },
        { status: 400 }
      );
    }

    // Guardar en hub_config
    const { error: cfgErr } = await supabaseAdmin
      .from("hub_config")
      .upsert({ key: "default_key_duration", value: duration });

    if (cfgErr) {
      return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 });
    }

    // Actualizar keys activas con menos tiempo restante que la nueva duración
    const durationMs = parseDurationMs(duration);
    let updatedCount = 0;

    if (durationMs !== null) {
      const newExpiresAt = new Date(Date.now() + durationMs).toISOString();

      const { data: activeKeys } = await supabaseAdmin
        .from("api_keys")
        .select("key, expires_at")
        .eq("is_active", true)
        .not("expires_at", "is", null)
        .gt("expires_at", new Date().toISOString());

      if (activeKeys && activeKeys.length > 0) {
        for (const k of activeKeys) {
          const remaining = new Date(k.expires_at).getTime() - Date.now();
          if (remaining < durationMs) {
            await supabaseAdmin
              .from("api_keys")
              .update({ expires_at: newExpiresAt })
              .eq("key", k.key);
            updatedCount++;
          }
        }
      }
    }

    return NextResponse.json({ success: true, duration, updatedCount });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
