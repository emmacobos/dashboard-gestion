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
    <main className="landing-sky flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="toon-card w-full max-w-sm space-y-4 p-8">
        <h1 className="font-display text-2xl font-extrabold text-ink">Iniciar sesión 🔑</h1>

        {error && <p className="toon-pill bg-punch text-ink">{error}</p>}

        <div>
          <label className="block text-sm font-bold text-ink">Usuario</label>
          <input
            className="toon-input mt-1 w-full"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink">Contraseña</label>
          <input
            type="password"
            className="toon-input mt-1 w-full"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="toon-btn toon-btn-primary w-full">
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        {loading && <ServerLoadingNotice />}

        <p className="text-sm font-semibold text-ink/80">
          ¿No tenés cuenta?{" "}
          <a href="/register" className="underline">
            Registrate
          </a>
        </p>
      </form>
    </main>
  );
}
