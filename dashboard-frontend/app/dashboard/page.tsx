import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { decodeJwtPayload } from "@/lib/jwt";
import { BACKEND_URL } from "@/lib/backend";
import LogoutButton from "./LogoutButton";

// Server Component: lee la cookie directo (sin pasar por el proxy de /api)
// y llama al backend para confirmar que el JWT sigue siendo valido ahi.
// El CRUD real de proyectos/tareas se construye en el Paso 4.
export default async function DashboardPage() {
  const token = await getAuthToken();

  if (!token) {
    redirect("/login");
  }

  const { sub: username } = decodeJwtPayload(token);

  const backendResponse = await fetch(`${BACKEND_URL}/api/test/user`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const backendMessage = backendResponse.ok
    ? await backendResponse.text()
    : "No se pudo verificar la sesion con el backend";

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Hola, {username}</h1>
          <LogoutButton />
        </div>
        <p className="mt-4 text-gray-600">Respuesta del backend: {backendMessage}</p>
      </div>
    </main>
  );
}
