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
      <h1 className="font-display text-2xl font-extrabold text-ink">Nuevo proyecto 🚀</h1>

      <form onSubmit={handleSubmit} className="toon-card mt-6 space-y-4 p-6">
        {error && <p className="toon-pill bg-punch text-ink">{error}</p>}

        <div>
          <label className="block text-sm font-bold text-ink">Nombre</label>
          <input className="toon-input mt-1 w-full" value={name} onChange={(event) => setName(event.target.value)} />
          {(nameError || fieldErrors.name) && (
            <p className="mt-1 text-sm font-bold text-punch">{nameError ?? fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-ink">Descripción</label>
          <textarea
            className="toon-input mt-1 w-full"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          {fieldErrors.description && <p className="mt-1 text-sm font-bold text-punch">{fieldErrors.description}</p>}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="toon-btn toon-btn-primary">
            {loading ? "Creando..." : "Crear proyecto"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/projects")}
            className="toon-btn toon-btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
