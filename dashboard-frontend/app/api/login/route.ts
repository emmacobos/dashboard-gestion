import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/backend";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { decodeJwtPayload } from "@/lib/jwt";

// Recibe username/password, llama al backend y si es exitoso guarda el JWT
// en una cookie httpOnly. Al cliente nunca le devolvemos el token, solo lo
// que necesita mostrar.
export async function POST(request: NextRequest) {
  const body = await request.text();

  const backendResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!backendResponse.ok) {
    const errorBody = await backendResponse.text();
    return new NextResponse(errorBody, {
      status: backendResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await backendResponse.json();
  const { token, id, username, email, roles } = data;

  const { exp } = decodeJwtPayload(token);
  const maxAge = exp - Math.floor(Date.now() / 1000);

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return NextResponse.json({ id, username, email, roles });
}
