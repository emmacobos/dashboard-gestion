import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthToken } from "@/lib/auth";
import { decodeJwtPayload } from "@/lib/jwt";

// Server Component: lee la cookie directo (sin pasar por el proxy de /api)
// y confirma que el JWT tiene un usuario valido. El CRUD real de
// proyectos/tareas vive en /dashboard/projects.
export default async function DashboardPage() {
  const token = await getAuthToken();

  if (!token) {
    redirect("/login");
  }

  const { sub: username } = decodeJwtPayload(token);

  return (
    <div className="rounded-lg bg-white p-8 shadow">
      <h1 className="text-2xl font-semibold text-gray-900">Hola, {username}</h1>
      <p className="mt-4 text-gray-600">
        Gestiona tus proyectos y tareas desde{" "}
        <Link href="/dashboard/projects" className="text-blue-600 hover:underline">
          Proyectos
        </Link>
        .
      </p>
    </div>
  );
}
