import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-server";
import type { TaskResponse, UserSummary } from "@/lib/types";
import TaskForm from "@/components/TaskForm";

type PageProps = { params: Promise<{ id: string; taskId: string }> };

// Server Component: trae la tarea a editar y la lista de usuarios en
// paralelo. Un 403 (tarea de un proyecto ajeno) se muestra inline, igual
// que en el detalle de proyecto - nunca como si la tarea no existiera.
export default async function EditTaskPage({ params }: PageProps) {
  const { id, taskId } = await params;
  const token = await getAuthToken();
  if (!token) {
    redirect("/login");
  }

  const [taskResult, usersResult] = await Promise.all([
    fetchFromBackend<TaskResponse>(`/api/tasks/${taskId}`, token),
    fetchFromBackend<UserSummary[]>("/api/users", token),
  ]);

  if (!taskResult.ok) {
    return (
      <div>
        <Link href={`/dashboard/projects/${id}`} className="text-sm font-bold text-ink underline">
          Volver al proyecto
        </Link>
        <p className="toon-panel mt-4 bg-punch/20 px-4 py-3 font-bold text-ink">
          {taskResult.status === 403
            ? "No tenes permisos para editar esta tarea."
            : taskResult.status === 404
              ? "Esta tarea no existe."
              : `No se pudo cargar la tarea: ${taskResult.message}`}
        </p>
      </div>
    );
  }

  if (!usersResult.ok) {
    return (
      <div>
        <Link href={`/dashboard/projects/${id}`} className="text-sm font-bold text-ink underline">
          Volver al proyecto
        </Link>
        <p className="toon-panel mt-4 bg-punch/20 px-4 py-3 font-bold text-ink">
          No se pudo cargar el formulario: {usersResult.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-extrabold text-ink">Editar tarea ✏️</h1>
      <TaskForm projectId={Number(id)} users={usersResult.data} initialTask={taskResult.data} />
    </div>
  );
}
