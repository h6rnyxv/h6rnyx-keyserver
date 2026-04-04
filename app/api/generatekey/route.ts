import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

async function validateWorkInkToken(token: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(
      `https://work.ink/_api/v2/token/isValid/${token}?deleteToken=1`,
      { cache: "no-store" }
    );
    if (!res.ok) return { valid: false, error: "Error al contactar work.ink" };
    const data = await res.json();
    if (!data.valid) return { valid: false, error: "Token inválido o expirado" };
    return { valid: true };
  } catch {
    return { valid: false, error: "No se pudo verificar el token" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const label: string = body.label || "";
    const workinkToken: string = body.workink_token || "";

    if (workinkToken) {
      const validation = await validateWorkInkToken(workinkToken);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || "Token de work.ink inválido" },
          { status: 403 }
        );
      }
    }

    const key = `h6x-${uuidv4().replace(/-/g, "").slice(0, 32)}`;

    const { error } = await supabaseAdmin.from("api_keys").insert({
      key,
      label: label || null,
      is_active: true,
    });

    if (error) {
      console.error("Error inserting key:", error);
      return NextResponse.json(
        { error: "Error al guardar la key en la base de datos" },
        { status: 500 }
      );
    }

    return NextResponse.json({ key, message: "Key generada exitosamente" });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
