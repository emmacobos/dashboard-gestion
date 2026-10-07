"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  taskPriorityLabel,
  type TaskPriority,
  type TaskResponse,
  type TaskStatus,
  type UserSummary,
} from "@/lib/types";
import DeleteTaskButton from "@/components/DeleteTaskButton";

type Props = { projectId: number; initialTasks: TaskResponse[] };

const COLUMNS: { status: TaskStatus; label: string; emoji: string }[] = [
  { status: "TODO", label: "Por hacer", emoji: "📝" },
  { status: "IN_PROGRESS", label: "En progreso", emoji: "🚧" },
  { status: "DONE", label: "Hecho", emoji: "🎉" },
];

const PRIORITY_CLASS: Record<TaskPriority, string> = {
  HIGH: "bg-punch",
  MEDIUM: "bg-sun",
  LOW: "bg-grass",
};

// Tablero Kanban: arrastrar una tarjeta a otra columna dispara el mismo
// PUT /api/tasks/{id} que ya usa el formulario de edicion, solo que con
// el status nuevo. Update optimista: si el PUT falla, la tarjeta vuelve a
// su columna original.
export default function TaskBoard({ projectId, initialTasks }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [userIdByUsername, setUserIdByUsername] = useState<Record<string, number>>({});
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<UserSummary[]>("/api/users")
      .then((res) => {
        const map: Record<string, number> = {};
        res.data.forEach((user) => {
          map[user.username] = user.id;
        });
        setUserIdByUsername(map);
      })
      .catch(() => {});
  }, []);

  async function handleDrop(newStatus: TaskStatus) {
    setDragOverStatus(null);
    const taskId = draggedId;
    setDraggedId(null);
    if (taskId == null) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const previousTasks = tasks;
    setTasks((current) => current.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    setError(null);

    try {
      await axios.put(`/api/tasks/${taskId}`, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedToId: task.assignedToUsername ? (userIdByUsername[task.assignedToUsername] ?? null) : null,
      });
    } catch {
      setTasks(previousTasks);
      setError("No se pudo mover la tarea. Intenta de nuevo.");
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="toon-panel px-5 py-4 font-semibold text-ink">
        Este proyecto todavia no tiene tareas. Arrancá con &quot;Nueva tarea&quot;.
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="toon-panel mb-3 bg-punch/20 px-4 py-2 text-sm font-bold text-ink">{error}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          return (
            <div
              key={col.status}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStatus(col.status);
              }}
              onDragLeave={() => setDragOverStatus((s) => (s === col.status ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(col.status);
              }}
              className={`toon-panel min-h-[140px] transition-shadow ${
                dragOverStatus === col.status ? "shadow-[7px_7px_0_#20232A]" : ""
              }`}
            >
              <div className="flex items-center gap-2 border-b-[3px] border-ink px-4 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-paper text-sm">
                  {col.emoji}
                </span>
                <h3 className="font-display flex-1 text-sm font-bold">{col.label}</h3>
                <span className="rounded-full bg-ink px-2 py-0.5 text-xs font-extrabold text-paper">
                  {colTasks.length}
                </span>
              </div>
              <div className="flex flex-col gap-3 p-3">
                {colTasks.map((task) => (
                  <div key={task.id} className="relative">
                    <div
                      draggable
                      onDragStart={() => setDraggedId(task.id)}
                      onDragEnd={() => setDraggedId(null)}
                      className={`toon-card cursor-grab px-3.5 py-3 transition-transform active:cursor-grabbing ${
                        draggedId === task.id ? "opacity-30" : "hover:-translate-y-0.5"
                      }`}
                    >
                      <Link
                        href={`/dashboard/projects/${projectId}/tasks/${task.id}/edit`}
                        className="font-display block text-[15px] font-bold leading-snug hover:underline"
                      >
                        {task.title}
                      </Link>
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs font-bold">
                        <span className={`toon-pill ${PRIORITY_CLASS[task.priority]}`}>
                          {taskPriorityLabel(task.priority)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {task.assignedToUsername && (
                            <span
                              className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-grape text-[9px] font-extrabold"
                              title={task.assignedToUsername}
                            >
                              {task.assignedToUsername.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                          {task.dueDate && <span>{task.dueDate}</span>}
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <DeleteTaskButton taskId={task.id} taskTitle={task.title} />
                      </div>
                    </div>
                    {task.status === "DONE" && (
                      <span
                        className="absolute -right-2 -top-3 flex h-10 w-10 rotate-12 items-center justify-center border-2 border-ink bg-grass font-display text-[8px] font-extrabold"
                        style={{
                          clipPath:
                            "polygon(50% 0%,61% 35%,95% 15%,75% 48%,100% 70%,65% 65%,55% 100%,42% 68%,8% 82%,28% 50%,0% 28%,38% 32%)",
                        }}
                      >
                        LISTO
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
