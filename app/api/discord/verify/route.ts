import { NextRequest, NextResponse } from "next/server";
  import { supabaseAdmin } from "@/lib/supabase";

  // GET ?vt=TOKEN → valida token, pone cookie, redirige a /?verified=1
  export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("vt");

    if (!token) {
      return NextResponse.redirect(new URL("/?error=token_missing", req.url));
    }

    const { data, error } = await supabaseAdmin
      .from("discord_verify_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !data) {
      return NextResponse.redirect(new URL("/?error=token_invalid", req.url));
    }

    // Marcar como usado
    await supabaseAdmin
      .from("discord_verify_tokens")
      .update({ used: true })
      .eq("token", token);

    const res = NextResponse.redirect(new URL("/?verified=1", req.url));
    res.cookies.set("discord_verified", data.discord_user_id, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutos para completar work.ink
      path: "/",
    });
    return res;
  }

  // POST → comprueba si la cookie de sesión Discord está activa
  export async function POST(req: NextRequest) {
    const cookie = req.cookies.get("discord_verified");
    if (cookie?.value) {
      return NextResponse.json({ verified: true });
    }
    return NextResponse.json({ verified: false });
  }
  