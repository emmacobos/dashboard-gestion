import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

// Proxea el registro al backend. No hay sesion todavia, no toca cookies.
export async function POST(request: NextRequest) {
  const body = await request.text();

  const backendResponse = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const responseBody = await backendResponse.text();
  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: { "Content-Type": "application/json" },
  });
}
