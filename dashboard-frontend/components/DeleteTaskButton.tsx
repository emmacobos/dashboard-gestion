"use client";

import { useDeleteAction } from "@/lib/useDeleteAction";

type Props = { taskId: number; taskTitle: string };

export default function DeleteTaskButton({ taskId, taskTitle }: Props) {
  const { deleting, error, handleDelete } = useDeleteAction(
    `/api/tasks/${taskId}`,
    `Seguro que queres borrar la tarea "${taskTitle}"? Esta accion no se puede deshacer.`,
  );

  return (
    <div className="text-right">
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-sm text-red-600 hover:underline disabled:opacity-50"
      >
        {deleting ? "Borrando..." : "Borrar"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
