import { NextRequest, NextResponse } from "next/server";
  import { supabaseAdmin } from "@/lib/supabase";

  function obfuscateLua(script: string): string {
    const key = Math.floor(Math.random() * 200) + 10;
    const bytes = Array.from(Buffer.from(script, "utf-8"));
    const encoded = bytes.map((b: number) => (b ^ key) & 0xff);
    const v1 = "_" + Math.random().toString(36).slice(2, 7);
    const v2 = "_" + Math.random().toString(36).slice(2, 7);
    const v3 = "_" + Math.random().toString(36).slice(2, 7);
    return `local ${v1}=${key};local ${v2}={${encoded.join(",")}};local ${v3}={};for i=1,#${v2} do ${v3}[i]=string.char(bit32.bxor(${v2}[i],${v1})) end;loadstring(table.concat(${v3}))()`;
  }

  export async function GET(req: NextRequest) {
    const key = req.headers.get("x-admin-key");
    if (!key || key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const name = req.nextUrl.searchParams.get("name") ?? "default";
    const dbKey = `loader_script_${name}`;
    try {
      const { data } = await supabaseAdmin
        .from("hub_config")
        .select("value")
        .eq("key", dbKey)
        .single();
      return NextResponse.json({ script: data?.value ?? "" });
    } catch {
      return NextResponse.json({ script: "" });
    }
  }

  export async function POST(req: NextRequest) {
    try {
      const body = await req.json().catch(() => ({}));
      if (!body.admin_key || body.admin_key !== process.env.ADMIN_KEY) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }

      const name: string = (body.name ?? "default")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");
      if (!name) {
        return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
      }

      let script: string = body.script ?? "";
      if (!script.trim()) {
        return NextResponse.json({ error: "El script no puede estar vacío" }, { status: 400 });
      }

      if (body.obfuscate) {
        script = obfuscateLua(script);
      }

      const dbKey = `loader_script_${name}`;
      const { error } = await supabaseAdmin
        .from("hub_config")
        .upsert({ key: dbKey, value: script });

      if (error) {
        return NextResponse.json({ error: "Error al guardar el script" }, { status: 500 });
      }

      return NextResponse.json({ success: true, bytes: script.length, name });
    } catch {
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  }
  