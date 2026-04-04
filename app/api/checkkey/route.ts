import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const key: string = body.key || "";

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { valid: false, message: "Se requiere una key válida" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select("id, key, is_active, label, created_at")
      .eq("key", key)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { valid: false, message: "Key no encontrada" },
        { status: 404 }
      );
    }

    if (!data.is_active) {
      return NextResponse.json(
        { valid: false, message: "Key desactivada" },
        { status: 403 }
      );
    }

    await supabaseAdmin
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("key", key);

    return NextResponse.json({
      valid: true,
      message: "Key válida y activa",
      label: data.label,
      created_at: data.created_at,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
