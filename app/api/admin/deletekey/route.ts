import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.admin_key || body.admin_key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    if (!body.key) {
      return NextResponse.json({ error: "Se requiere la key" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("api_keys")
      .delete()
      .eq("key", body.key);

    if (error) {
      return NextResponse.json({ error: "Error al eliminar la key" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
