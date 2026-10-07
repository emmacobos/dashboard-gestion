import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-server";
import type { ProjectResponse } from "@/lib/types";

// Server Component: lista los proyectos visibles para el usuario logueado
// (propios si es USER, todos si es ADMIN - lo decide el backend). El estado
// de "cargando" lo cubre loading.tsx de este mismo segmento.
export default async function ProjectsPage() {
  const token = await getAuthToken();
  if (!token) {
    redirect("/login");
  }

  const result = await fetchFromBackend<ProjectResponse[]>("/api/projects", token);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-ink">Proyectos 🗂️</h1>
        <Link href="/dashboard/projects/new" className="toon-btn toon-btn-primary">
          Nuevo proyecto
        </Link>
      </div>

      <div className="mt-6">
        {!result.ok && (
          <p className="toon-panel bg-punch/20 px-4 py-3 font-bold text-ink">
            No se pudieron cargar los proyectos: {result.message}
          </p>
        )}

        {result.ok && result.data.length === 0 && (
          <p className="toon-panel px-4 py-4 font-semibold text-ink">
            Todavía no tenés proyectos. Arrancá con &quot;Nuevo proyecto&quot;.
          </p>
        )}

        {result.ok && result.data.length > 0 && (
          <ul className="flex flex-col gap-3">
            {result.data.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="toon-panel flex items-center justify-between px-4 py-3 transition-transform hover:-translate-y-0.5"
                >
                  <div>
                    <p className="font-display font-bold text-ink">{project.name}</p>
                    {project.description && (
                      <p className="text-sm font-semibold text-ink/70">{project.description}</p>
                    )}
                  </div>
                  <span className="toon-pill bg-grape text-ink">{project.createdByUsername}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
