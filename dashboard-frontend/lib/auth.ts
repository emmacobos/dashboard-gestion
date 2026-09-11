import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

// Helper de servidor: lee el JWT de la cookie httpOnly.
// Nunca se expone al JS del navegador.
export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}
