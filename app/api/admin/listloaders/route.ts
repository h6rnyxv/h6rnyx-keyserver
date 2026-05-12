import { NextRequest, NextResponse } from "next/server";
  import { supabaseAdmin } from "@/lib/supabase";

  export async function POST(req: NextRequest) {
    try {
      const body = await req.json().catch(() => ({}));
      if (!body.admin_key || body.admin_key !== process.env.ADMIN_KEY) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }

      const { data, error } = await supabaseAdmin
        .from("hub_config")
        .select("key, value")
        .like("key", "loader_script_%");

      if (error) {
        return NextResponse.json({ error: "Error al obtener loaders" }, { status: 500 });
      }

      const loaders = (data ?? []).map((row) => ({
        name: row.key.replace("loader_script_", ""),
        bytes: row.value?.length ?? 0,
      }));

      return NextResponse.json({ loaders });
    } catch {
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  }
  