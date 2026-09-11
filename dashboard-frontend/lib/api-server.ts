import { BACKEND_URL } from "@/lib/backend";

// Resultado tipado de una lectura server-side al backend: evita que cada
// Server Component repita su propio try/catch para distinguir 403/404/500.
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

// Solo para Server Components/Route Handlers: llama directo al backend
// Spring Boot agregando el header Authorization a partir del token que ya se
// leyo de la cookie httpOnly.
export async function fetchFromBackend<T>(
  path: string,
  token: string | undefined,
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 0, message: "No se pudo conectar con el servidor" };
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && typeof (body as Record<string, unknown>).message === "string"
        ? (body as Record<string, string>).message
        : `Error ${response.status}`;
    return { ok: false, status: response.status, message };
  }

  return { ok: true, data: body as T };
}
