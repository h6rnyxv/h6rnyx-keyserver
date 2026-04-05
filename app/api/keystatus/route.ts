import { NextRequest, NextResponse } from "next/server";
  import { supabaseAdmin } from "@/lib/supabase";

  export async function POST(req: NextRequest) {
    try {
      const body = await req.json().catch(() => ({}));
      const key: string = body.key || "";

      if (!key || typeof key !== "string") {
        return NextResponse.json({ valid: false, message: "Se requiere una key" }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from("api_keys")
        .select("id, key, label, is_active, created_at, expires_at, last_used_at, roblox_username")
        .eq("key", key)
        .single();

      if (error || !data) {
        return NextResponse.json({ valid: false, message: "Key no encontrada" }, { status: 404 });
      }

      const now = new Date();
      const expired = data.expires_at ? new Date(data.expires_at) < now : false;
      const active = data.is_active && !expired;

      let timeLeft: string | null = null;
      let msLeft: number | null = null;
      if (data.expires_at && !expired) {
        msLeft = new Date(data.expires_at).getTime() - now.getTime();
        const days = Math.floor(msLeft / 86400000);
        const hours = Math.floor((msLeft % 86400000) / 3600000);
        const mins = Math.floor((msLeft % 3600000) / 60000);
        if (days > 0) timeLeft = `${days}d ${hours}h ${mins}m`;
        else if (hours > 0) timeLeft = `${hours}h ${mins}m`;
        else timeLeft = `${mins}m`;
      } else if (!data.expires_at) {
        timeLeft = "lifetime";
      }

      return NextResponse.json({
        found: true,
        active,
        expired,
        label: data.label,
        created_at: data.created_at,
        expires_at: data.expires_at,
        last_used_at: data.last_used_at,
        roblox_username: data.roblox_username,
        time_left: timeLeft,
        ms_left: msLeft,
      });
    } catch {
      return NextResponse.json({ valid: false, message: "Error interno" }, { status: 500 });
    }
  }
  