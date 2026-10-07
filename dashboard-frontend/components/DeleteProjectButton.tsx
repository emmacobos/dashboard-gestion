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
      <button onClick={handleDelete} disabled={deleting} className="toon-btn toon-btn-danger">
        {deleting ? "Borrando..." : "🗑️ Borrar proyecto"}
      </button>
      {error && <p className="mt-1 text-sm font-bold text-ink">{error}</p>}
    </div>
  );
}
