import { NextResponse } from "next/server";
  import { supabaseAdmin } from "@/lib/supabase";

  export async function GET(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
  ) {
    const { slug } = await params;
    const dbKey = `loader_script_${slug}`;

    try {
      const { data } = await supabaseAdmin
        .from("hub_config")
        .select("value")
        .eq("key", dbKey)
        .single();

      if (!data?.value) {
        return new NextResponse("-- Loader not found. Contact staff.", {
          status: 404,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }

      return new NextResponse(data.value, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      });
    } catch {
      return new NextResponse("-- Error loading script.", {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }
  