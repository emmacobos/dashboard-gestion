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
    <div className="toon-card px-6 py-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">¡Hola, {username}! 👋</h1>
      <p className="mt-3 font-semibold text-ink/80">
        Gestioná tus proyectos y tareas desde{" "}
        <Link href="/dashboard/projects" className="underline">
          Proyectos
        </Link>
        .
      </p>
    </div>
  );
}
