import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-bot-secret");
  if (!secret || secret !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { discord_user_id } = await req.json().catch(() => ({}));
  if (!discord_user_id) {
    return NextResponse.json({ error: "discord_user_id requerido" }, { status: 400 });
  }

  const token = uuidv4().replace(/-/g, "");
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin
    .from("discord_verify_tokens")
    .insert({ token, discord_user_id, expires_at, used: false });

  if (error) {
    console.error("Error al crear token:", error);
    return NextResponse.json({ error: "Error al crear token" }, { status: 500 });
  }

  return NextResponse.json({ token });
}
