import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-server";
import { taskPriorityLabel, taskStatusLabel, type ProjectResponse, type TaskResponse } from "@/lib/types";
import DeleteProjectButton from "@/components/DeleteProjectButton";
import DeleteTaskButton from "@/components/DeleteTaskButton";

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
        <Link href="/dashboard/projects" className="text-sm text-blue-600 hover:underline">
          Volver a proyectos
        </Link>
        <p className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
      <Link href="/dashboard/projects" className="text-sm text-blue-600 hover:underline">
        Volver a proyectos
      </Link>

      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
          {project.description && <p className="mt-1 text-gray-600">{project.description}</p>}
          <p className="mt-1 text-sm text-gray-500">Creado por {project.createdByUsername}</p>
        </div>
        <DeleteProjectButton projectId={project.id} projectName={project.name} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tareas</h2>
        <Link
          href={`/dashboard/projects/${project.id}/tasks/new`}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Nueva tarea
        </Link>
      </div>

      <div className="mt-4">
        {!tasksResult.ok && (
          <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            No se pudieron cargar las tareas: {tasksResult.message}
          </p>
        )}

        {tasksResult.ok && tasksResult.data.length === 0 && (
          <p className="rounded border border-gray-200 bg-white p-4 text-sm text-gray-600">
            Este proyecto todavia no tiene tareas.
          </p>
        )}

        {tasksResult.ok && tasksResult.data.length > 0 && (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {tasksResult.data.map((task) => (
              <li key={task.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <Link
                    href={`/dashboard/projects/${project.id}/tasks/${task.id}/edit`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {task.title}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {taskStatusLabel(task.status)} · {taskPriorityLabel(task.priority)}
                    {task.dueDate && ` · vence ${task.dueDate}`}
                    {task.assignedToUsername && ` · asignada a ${task.assignedToUsername}`}
                  </p>
                </div>
                <DeleteTaskButton taskId={task.id} taskTitle={task.title} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
