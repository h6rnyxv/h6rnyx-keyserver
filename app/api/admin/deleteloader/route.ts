import { NextRequest, NextResponse } from "next/server";
  import { supabaseAdmin } from "@/lib/supabase";

  export async function POST(req: NextRequest) {
    try {
      const body = await req.json().catch(() => ({}));
      if (!body.admin_key || body.admin_key !== process.env.ADMIN_KEY) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }

      const name: string = (body.name ?? "").trim();
      if (!name) {
        return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
      }

      const dbKey = `loader_script_${name}`;
      const { error } = await supabaseAdmin
        .from("hub_config")
        .delete()
        .eq("key", dbKey);

      if (error) {
        return NextResponse.json({ error: "Error al eliminar el loader" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  }
  