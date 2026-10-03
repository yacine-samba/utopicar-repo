import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { comptesActifs, SUPABASE_CLE, SUPABASE_URL } from "@/lib/supabase/config";

// Rafraîchit la session Supabase à chaque page (cookies), sans bloquer quand les comptes ne sont pas configurés.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!comptesActifs()) return response;
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_CLE, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (liste) => {
        liste.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        liste.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/stripe/webhook|icon.svg|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
