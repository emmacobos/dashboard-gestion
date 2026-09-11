import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/backend";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

// Proxy generico para el resto de la API (/api/projects, /api/tasks, etc.):
// lee el JWT de la cookie httpOnly, arma el header Authorization y reenvia
// la llamada al backend Spring Boot. Los client components le pegan a estas
// rutas propias de Next, nunca a localhost:8080 directo.
async function proxyToBackend(request: NextRequest, path: string[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  const backendUrl = `${BACKEND_URL}/api/${path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  const backendResponse = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: hasBody ? await request.text() : undefined,
  });

  if (backendResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const responseBody = await backendResponse.text();
  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("Content-Type") ?? "application/json",
    },
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxyToBackend(request, path);
}
