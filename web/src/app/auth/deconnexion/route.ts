import { NextResponse } from "next/server";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { comptesActifs } from "@/lib/supabase/config";

export async function POST(req: Request) {
  if (comptesActifs()) await (await supabaseServeur()).auth.signOut();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
