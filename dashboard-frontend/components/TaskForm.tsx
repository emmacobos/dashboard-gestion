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
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg bg-white p-6 shadow">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Titulo</label>
        <input
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        {(titleError || fieldErrors.title) && (
          <p className="mt-1 text-sm text-red-600">{titleError ?? fieldErrors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descripcion</label>
        <textarea
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        {fieldErrors.description && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
          >
            {TASK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.status && <p className="mt-1 text-sm text-red-600">{fieldErrors.status}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prioridad</label>
          <select
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
          >
            {TASK_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.priority && <p className="mt-1 text-sm text-red-600">{fieldErrors.priority}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha limite</label>
          <input
            type="date"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          {fieldErrors.dueDate && <p className="mt-1 text-sm text-red-600">{fieldErrors.dueDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Asignada a</label>
          <select
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
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
            <p className="mt-1 text-sm text-red-600">{fieldErrors.assignedToId}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear tarea"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/projects/${projectId}`)}
          className="rounded bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
