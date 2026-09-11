"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { parseApiError } from "@/lib/api-errors";

// Hook compartido por los botones de borrar (proyecto y tarea): pide
// confirmacion con window.confirm antes de ejecutar, llama DELETE contra el
// proxy y refresca la ruta actual (o corre onDeleted si la pantalla actual
// deja de tener sentido, como al borrar el proyecto que se esta viendo).
export function useDeleteAction(url: string, confirmMessage: string, onDeleted?: () => void) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) {
      return;
    }
    setError(null);
    setDeleting(true);

    try {
      await axios.delete(url);
      if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setDeleting(false);
    }
  }

  return { deleting, error, handleDelete };
}
