import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-server";
import type { UserSummary } from "@/lib/types";
import TaskForm from "@/components/TaskForm";

type PageProps = { params: Promise<{ id: string }> };

// Server Component: solo trae la lista de usuarios para el select de
// "asignada a" y le pasa el resto del trabajo al TaskForm (Client Component).
export default async function NewTaskPage({ params }: PageProps) {
  const { id } = await params;
  const token = await getAuthToken();
  if (!token) {
    redirect("/login");
  }

  const usersResult = await fetchFromBackend<UserSummary[]>("/api/users", token);

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
