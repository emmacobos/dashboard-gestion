// Tipos que reflejan los DTOs reales del backend (ver dto/ProjectResponse.java,
// dto/TaskResponse.java, entity/TaskStatus.java, entity/TaskPriority.java).
// Mantenerlos sincronizados a mano: no hay generacion automatica de tipos.

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type ProjectResponse = {
  id: number;
  name: string;
  description: string | null;
  createdByUsername: string;
  createdAt: string;
};

export type TaskResponse = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: number;
  projectName: string;
  assignedToId: number | null;
  assignedToUsername: string | null;
};

export type UserSummary = {
  id: number;
  username: string;
};

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "Por hacer" },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "DONE", label: "Hecho" },
];

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "LOW", label: "Baja" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
];

export function taskStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function taskPriorityLabel(priority: TaskPriority): string {
  return TASK_PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ?? priority;
}
