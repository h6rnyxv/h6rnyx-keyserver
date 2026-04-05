import { NextRequest, NextResponse } from "next/server";
  import { supabaseAdmin } from "@/lib/supabase";

  export async function POST(req: NextRequest) {
    try {
      const body = await req.json().catch(() => ({}));
      const key: string = body.key || "";
      const robloxUsername: string = body.roblox_username || "";

      if (!key || typeof key !== "string") {
        return NextResponse.json({ valid: false, message: "Se requiere una key válida" });
      }

      const { data, error } = await supabaseAdmin
        .from("api_keys")
        .select("id, key, is_active, label, created_at, expires_at")
        .eq("key", key)
        .single();

      if (error || !data) {
        return NextResponse.json({ valid: false, message: "Key no encontrada" });
      }

      if (!data.is_active) {
        return NextResponse.json({ valid: false, message: "Key desactivada" });
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        await supabaseAdmin.from("api_keys").update({ is_active: false }).eq("key", key);
        return NextResponse.json({ valid: false, message: "Key expirada" });
      }

      try {
        const updateData: Record<string, string> = { last_used_at: new Date().toISOString() };
        if (robloxUsername) updateData.roblox_username = robloxUsername;
        await supabaseAdmin.from("api_keys").update(updateData).eq("key", key);
      } catch { /* columnas opcionales, no crítico */ }

      return NextResponse.json({
        valid: true,
        message: "Key válida y activa",
        label: data.label,
        created_at: data.created_at,
        expires_at: data.expires_at || "never",
      });
    } catch {
      return NextResponse.json({ valid: false, message: "Error interno del servidor" });
    }
  }
  