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
        onMouseDown={(e) => e.stopPropagation()}
        disabled={deleting}
        className="toon-pill bg-cloud text-ink hover:bg-punch disabled:opacity-50"
      >
        {deleting ? "Borrando..." : "🗑️ Borrar"}
      </button>
      {error && <p className="text-xs font-bold text-ink">{error}</p>}
    </div>
  );
}
