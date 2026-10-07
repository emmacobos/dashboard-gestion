import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-server";
import type { ProjectResponse, TaskResponse } from "@/lib/types";
import DeleteProjectButton from "@/components/DeleteProjectButton";
import TaskBoard from "@/components/TaskBoard";

type PageProps = { params: Promise<{ id: string }> };

// Server Component: trae el proyecto y sus tareas directo del backend.
// Un 403 (proyecto de otro usuario) se muestra como mensaje claro dentro de
// la pantalla, nunca como redirect - eso haria pensar que el proyecto no existe.
export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const token = await getAuthToken();
  if (!token) {
    redirect("/login");
  }

  const projectResult = await fetchFromBackend<ProjectResponse>(`/api/projects/${id}`, token);

  if (!projectResult.ok) {
    return (
      <div>
        <Link href="/dashboard/projects" className="font-bold text-ink underline">
          Volver a proyectos
        </Link>
        <p className="toon-panel mt-4 bg-punch/20 px-4 py-3 font-bold text-ink">
          {projectResult.status === 403
            ? "No tenes permisos para ver este proyecto."
            : projectResult.status === 404
              ? "Este proyecto no existe."
              : `No se pudo cargar el proyecto: ${projectResult.message}`}
        </p>
      </div>
    );
  }

  const project = projectResult.data;
  const tasksResult = await fetchFromBackend<TaskResponse[]>(`/api/projects/${id}/tasks`, token);

  return (
    <div>
      <Link href="/dashboard/projects" className="text-sm font-bold text-ink underline">
        Volver a proyectos
      </Link>

      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">{project.name}</h1>
          {project.description && <p className="mt-1 font-semibold text-ink/80">{project.description}</p>}
          <p className="mt-1 text-sm font-bold text-ink/60">Creado por {project.createdByUsername}</p>
        </div>
        <DeleteProjectButton projectId={project.id} projectName={project.name} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">Tareas</h2>
        <Link href={`/dashboard/projects/${project.id}/tasks/new`} className="toon-btn toon-btn-primary">
          Nueva tarea
        </Link>
      </div>

      <div className="mt-4">
        {!tasksResult.ok && (
          <p className="toon-panel bg-punch/20 px-4 py-3 font-bold text-ink">
            No se pudieron cargar las tareas: {tasksResult.message}
          </p>
        )}

        {tasksResult.ok && <TaskBoard projectId={project.id} initialTasks={tasksResult.data} />}
      </div>
    </div>
  );
}
