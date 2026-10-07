"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { parseApiError, type FieldErrors } from "@/lib/api-errors";
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  type TaskPriority,
  type TaskResponse,
  type TaskStatus,
  type UserSummary,
} from "@/lib/types";

type TaskFormProps = {
  projectId: number;
  users: UserSummary[];
  // Si viene presente, el formulario edita esta tarea (PUT); si no, crea una nueva (POST).
  initialTask?: TaskResponse;
};

// Formulario compartido por /tasks/new y /tasks/[taskId]/edit: los selects de
// status/priority usan los valores reales de TaskStatus/TaskPriority del
// backend, nunca strings inventados en el frontend.
export default function TaskForm({ projectId, users, initialTask }: TaskFormProps) {
  const router = useRouter();
  const isEditing = initialTask != null;

  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? "TODO");
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(initialTask?.dueDate ?? "");
  const [assignedToId, setAssignedToId] = useState(
    initialTask?.assignedToUsername
      ? String(users.find((user) => user.username === initialTask.assignedToUsername)?.id ?? "")
      : "",
  );

  const [titleError, setTitleError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!title.trim()) {
      setTitleError("El titulo es obligatorio");
      return;
    }
    setTitleError(null);
    setLoading(true);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      dueDate: dueDate || null,
      assignedToId: assignedToId ? Number(assignedToId) : null,
    };

    try {
      if (isEditing) {
        await axios.put(`/api/tasks/${initialTask.id}`, payload);
      } else {
        await axios.post(`/api/projects/${projectId}/tasks`, payload);
      }
      router.push(`/dashboard/projects/${projectId}`);
      router.refresh();
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors ?? {});
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="toon-card mt-6 space-y-4 p-6">
      {error && <p className="toon-pill bg-punch text-ink">{error}</p>}

      <div>
        <label className="block text-sm font-bold text-ink">Título</label>
        <input className="toon-input mt-1 w-full" value={title} onChange={(event) => setTitle(event.target.value)} />
        {(titleError || fieldErrors.title) && (
          <p className="mt-1 text-sm font-bold text-punch">{titleError ?? fieldErrors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-ink">Descripción</label>
        <textarea
          className="toon-input mt-1 w-full"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        {fieldErrors.description && <p className="mt-1 text-sm font-bold text-punch">{fieldErrors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-ink">Estado</label>
          <select
            className="toon-input mt-1 w-full"
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
          >
            {TASK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.status && <p className="mt-1 text-sm font-bold text-punch">{fieldErrors.status}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-ink">Prioridad</label>
          <select
            className="toon-input mt-1 w-full"
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
          >
            {TASK_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.priority && <p className="mt-1 text-sm font-bold text-punch">{fieldErrors.priority}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-ink">Fecha límite</label>
          <input
            type="date"
            className="toon-input mt-1 w-full"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          {fieldErrors.dueDate && <p className="mt-1 text-sm font-bold text-punch">{fieldErrors.dueDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-ink">Asignada a</label>
          <select
            className="toon-input mt-1 w-full"
            value={assignedToId}
            onChange={(event) => setAssignedToId(event.target.value)}
          >
            <option value="">Sin asignar</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
          {fieldErrors.assignedToId && (
            <p className="mt-1 text-sm font-bold text-punch">{fieldErrors.assignedToId}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="toon-btn toon-btn-primary">
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear tarea"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/projects/${projectId}`)}
          className="toon-btn toon-btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
