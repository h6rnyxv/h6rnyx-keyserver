import { NextResponse } from "next/server";
  import { supabaseAdmin } from "@/lib/supabase";

  export async function GET() {
    try {
      const { data } = await supabaseAdmin
        .from("hub_config")
        .select("value")
        .eq("key", "loader_script_default")
        .single();

      if (data?.value) {
        return new NextResponse(data.value, {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
        });
      }

      const { data: legacy } = await supabaseAdmin
        .from("hub_config")
        .select("value")
        .eq("key", "loader_script")
        .single();

      if (!legacy?.value) {
        return new NextResponse("-- Script not configured. Contact staff.", {
          status: 404,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }

      return new NextResponse(legacy.value, {
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
  