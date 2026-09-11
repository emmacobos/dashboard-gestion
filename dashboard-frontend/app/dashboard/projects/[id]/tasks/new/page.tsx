import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-server";
import type { ProjectResponse, UserSummary } from "@/lib/types";
import TaskForm from "@/components/TaskForm";

type PageProps = { params: Promise<{ id: string }> };

// Server Component: verifica el acceso al proyecto ANTES de renderizar el
// formulario (mismo criterio que /dashboard/projects/[id] - un 403/404 se
// muestra inline, nunca un formulario que recien falla al hacer submit), y
// trae la lista de usuarios para el select de "asignada a".
export default async function NewTaskPage({ params }: PageProps) {
  const { id } = await params;
  const token = await getAuthToken();
  if (!token) {
    redirect("/login");
  }

  const [projectResult, usersResult] = await Promise.all([
    fetchFromBackend<ProjectResponse>(`/api/projects/${id}`, token),
    fetchFromBackend<UserSummary[]>("/api/users", token),
  ]);

  if (!projectResult.ok) {
    return (
      <div>
        <Link href={`/dashboard/projects/${id}`} className="text-sm text-blue-600 hover:underline">
          Volver al proyecto
        </Link>
        <p className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {projectResult.status === 403
            ? "No tenes permisos para agregar tareas a este proyecto."
            : projectResult.status === 404
              ? "Este proyecto no existe."
              : `No se pudo cargar el proyecto: ${projectResult.message}`}
        </p>
      </div>
    );
  }

  if (!usersResult.ok) {
    return (
      <div>
        <Link href={`/dashboard/projects/${id}`} className="text-sm text-blue-600 hover:underline">
          Volver al proyecto
        </Link>
        <p className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudo cargar el formulario: {usersResult.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold text-gray-900">Nueva tarea</h1>
      <TaskForm projectId={Number(id)} users={usersResult.data} />
    </div>
  );
}
