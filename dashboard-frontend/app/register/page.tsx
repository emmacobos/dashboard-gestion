"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ServerLoadingNotice from "@/components/ServerLoadingNotice";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axios.post("/api/register", { username, email, password });
      router.push("/login");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, unknown>;
        const message =
          typeof data.message === "string" ? data.message : Object.values(data)[0];
        setError(typeof message === "string" ? message : "No se pudo registrar");
      } else {
        setError("No se pudo registrar");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="landing-sky flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="toon-card w-full max-w-sm space-y-4 p-8">
        <h1 className="font-display text-2xl font-extrabold text-ink">Crear cuenta ✨</h1>

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
          <label className="block text-sm font-bold text-ink">Email</label>
          <input
            type="email"
            className="toon-input mt-1 w-full"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
          {loading ? "Creando..." : "Crear cuenta"}
        </button>

        {loading && <ServerLoadingNotice />}

        <p className="text-sm font-semibold text-ink/80">
          ¿Ya tenés cuenta?{" "}
          <a href="/login" className="underline">
            Ingresá
          </a>
        </p>
      </form>
    </main>
  );
}
