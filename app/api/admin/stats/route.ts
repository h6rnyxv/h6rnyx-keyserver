import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.admin_key || body.admin_key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: keys, error } = await supabaseAdmin
      .from("api_keys")
      .select("id, key, label, is_active, created_at, expires_at, last_used_at, roblox_username")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
    }

    const active = keys?.filter(k => k.is_active && (!k.expires_at || new Date(k.expires_at) > new Date())).length ?? 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const generatedToday = keys?.filter(k => new Date(k.created_at) >= today).length ?? 0;
    const usedKeys = keys?.filter(k => k.last_used_at).length ?? 0;

    return NextResponse.json({ active, total: keys?.length ?? 0, generatedToday, usedKeys, keys: keys ?? [] });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
