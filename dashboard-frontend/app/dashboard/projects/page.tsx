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
        <h1 className="text-2xl font-semibold text-gray-900">Proyectos</h1>
        <Link
          href="/dashboard/projects/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Nuevo proyecto
        </Link>
      </div>

      <div className="mt-6">
        {!result.ok && (
          <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            No se pudieron cargar los proyectos: {result.message}
          </p>
        )}

        {result.ok && result.data.length === 0 && (
          <p className="rounded border border-gray-200 bg-white p-4 text-sm text-gray-600">
            Todavia no tenes proyectos. Crea el primero con &quot;Nuevo proyecto&quot;.
          </p>
        )}

        {result.ok && result.data.length > 0 && (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {result.data.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{project.name}</p>
                    {project.description && (
                      <p className="text-sm text-gray-600">{project.description}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{project.createdByUsername}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
