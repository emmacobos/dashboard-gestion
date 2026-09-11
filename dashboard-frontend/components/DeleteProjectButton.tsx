"use client";

import { useRouter } from "next/navigation";
import { useDeleteAction } from "@/lib/useDeleteAction";

type Props = { projectId: number; projectName: string };

export default function DeleteProjectButton({ projectId, projectName }: Props) {
  const router = useRouter();
  const { deleting, error, handleDelete } = useDeleteAction(
    `/api/projects/${projectId}`,
    `Seguro que queres borrar el proyecto "${projectName}"? Se van a borrar tambien todas sus tareas. Esta accion no se puede deshacer.`,
    () => {
      router.push("/dashboard/projects");
      router.refresh();
    },
  );

  return (
    <div className="text-right">
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
      >
        {deleting ? "Borrando..." : "Borrar proyecto"}
      </button>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
