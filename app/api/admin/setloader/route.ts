import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET — devuelve el script actual
export async function GET(req: NextRequest) {
  const key = req.headers.get("x-admin-key");
  if (!key || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { data } = await supabaseAdmin
      .from("hub_config")
      .select("value")
      .eq("key", "loader_script")
      .single();
    return NextResponse.json({ script: data?.value ?? "" });
  } catch {
    return NextResponse.json({ script: "" });
  }
}

// POST — actualiza el script
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.admin_key || body.admin_key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const script: string = body.script ?? "";
    if (!script.trim()) {
      return NextResponse.json({ error: "El script no puede estar vacío" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("hub_config")
      .upsert({ key: "loader_script", value: script });

    if (error) {
      return NextResponse.json({ error: "Error al guardar el script" }, { status: 500 });
    }

    return NextResponse.json({ success: true, bytes: script.length });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
