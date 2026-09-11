"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { parseApiError, type FieldErrors } from "@/lib/api-errors";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!name.trim()) {
      setNameError("El nombre es obligatorio");
      return;
    }
    setNameError(null);
    setLoading(true);

    try {
      // Le pega al proxy generico /api/[...path], que reenvia con el
      // Authorization armado desde la cookie httpOnly.
      const response = await axios.post<{ id: number }>("/api/projects", {
        name: name.trim(),
        description: description.trim() || null,
      });
      router.push(`/dashboard/projects/${response.data.id}`);
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
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold text-gray-900">Nuevo proyecto</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg bg-white p-6 shadow">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {(nameError || fieldErrors.name) && (
            <p className="mt-1 text-sm text-red-600">{nameError ?? fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descripcion</label>
          <textarea
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear proyecto"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/projects")}
            className="rounded bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
