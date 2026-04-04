import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const label: string = body.label || "";

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
