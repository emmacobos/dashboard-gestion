"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ServerLoadingNotice from "@/components/ServerLoadingNotice";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // El cliente le pega a nuestra propia ruta de Next, nunca al backend
      // directo: es esta ruta la que sabe del backend y setea la cookie.
      await axios.post("/api/login", { username, password });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response?.data?.message === "string") {
        setError(err.response.data.message);
      } else {
        setError("No se pudo iniciar sesion");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-semibold text-gray-900">Iniciar sesion</h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Usuario</label>
          <input
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contrasena</label>
          <input
            type="password"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        {loading && <ServerLoadingNotice />}

        <p className="text-sm text-gray-600">
          No tenes cuenta?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Registrate
          </a>
        </p>
      </form>
    </main>
  );
}
