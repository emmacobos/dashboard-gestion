import Link from "next/link";
import { getAuthToken } from "@/lib/auth";

const REPO_URL = "https://github.com/emmacobos/dashboard-gestion";

const FEATURES = [
  { emoji: "🔐", title: "Login real con JWT", text: "Registro, login y rutas protegidas - el token vive en una cookie httpOnly, nunca en localStorage." },
  { emoji: "🗂️", title: "Proyectos y tareas", text: "CRUD completo: estado, prioridad, fecha límite y a quién está asignada cada tarea." },
  { emoji: "🖐️", title: "Tablero arrastrable", text: "Las tareas se mueven entre columnas arrastrando la tarjeta, sin recargar la página." },
  { emoji: "🛡️", title: "Roles de verdad", text: "Un usuario común ve sus propios proyectos; un admin ve y administra los de todos." },
];

const STACK = ["Java 21", "Spring Boot", "PostgreSQL", "JWT", "Next.js", "Tailwind"];

const STEPS = [
  { num: "1", text: "Creá una cuenta o entrá a la demo." },
  { num: "2", text: "Armá un proyecto (ej: \"Lanzar mi blog\")." },
  { num: "3", text: "Agregale tareas y arrastralas entre columnas a medida que avanzan." },
];

export default async function LandingPage() {
  const token = await getAuthToken();

  return (
    <main className="landing-sky min-h-screen">
      <div className="mx-auto max-w-4xl px-5 pt-14 pb-20">
        <div className="grid grid-cols-[88px_1fr] gap-5 sm:grid-cols-[110px_1fr]">
          <svg viewBox="0 0 110 110" fill="none" className="animate-bob">
            <circle cx="55" cy="55" r="42" fill="#FFCF4D" stroke="#20232A" strokeWidth="4" />
            <circle cx="40" cy="50" r="8" fill="#FFF9EC" stroke="#20232A" strokeWidth="3" />
            <circle cx="42" cy="51" r="3.2" fill="#20232A" />
            <circle cx="72" cy="50" r="8" fill="#FFF9EC" stroke="#20232A" strokeWidth="3" />
            <circle cx="74" cy="51" r="3.2" fill="#20232A" />
            <path d="M38 70 Q55 84 74 70" stroke="#20232A" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="26" cy="62" r="6" fill="#FF6B6B" opacity=".6" />
            <circle cx="86" cy="62" r="6" fill="#FF6B6B" opacity=".6" />
            <path d="M90 40 Q104 30 100 16" stroke="#20232A" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="14" r="6" fill="#B18CFF" stroke="#20232A" strokeWidth="3" />
          </svg>
          <div className="toon-card relative px-5 py-4">
            <p className="font-bold text-ink">
              Hola, soy Emma. Esto lo construí de punta a punta: backend, frontend y deploy.
            </p>
          </div>
        </div>

        <h1 className="font-display mt-7 text-4xl font-extrabold leading-[1.05] text-paper drop-shadow-[3px_3px_0_#20232A] sm:text-5xl">
          Dashboard de Gestión de Proyectos
        </h1>
        <p className="toon-card mt-4 inline-block max-w-prose px-5 py-3 font-bold text-ink">
          Organizá tus proyectos en tableros: creá tareas, asignales prioridad y fecha
          límite, y arrastralas entre columnas a medida que avanzan. Por abajo: backend en
          Java + Spring Boot con autenticación JWT, frontend en Next.js. Todo lo que ves
          corre en producción, ahora mismo, con datos reales.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-bold text-ink">
          {STEPS.map((step, i) => (
            <span key={step.num} className="flex items-center gap-2">
              <span className="toon-pill bg-grass text-ink">
                <span className="font-display">{step.num}</span> {step.text}
              </span>
              {i < STEPS.length - 1 && <span aria-hidden="true">→</span>}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {STACK.map((item) => (
            <span key={item} className="toon-pill bg-paper text-ink">
              {item}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {token ? (
            <Link href="/dashboard" className="toon-btn toon-btn-primary">
              Ir a mi dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="toon-btn toon-btn-primary">
                Entrar a la demo
              </Link>
              <Link href="/register" className="toon-btn toon-btn-secondary">
                Crear una cuenta
              </Link>
            </>
          )}
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="toon-btn toon-btn-grape">
            Ver el código en GitHub
          </a>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="toon-panel px-5 py-4">
              <p className="font-display text-lg font-bold text-ink">
                <span className="mr-2">{f.emoji}</span>
                {f.title}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-ink/80">{f.text}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm font-bold text-ink/70">
          Repo:{" "}
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="underline">
            github.com/emmacobos/dashboard-gestion
          </a>
        </p>
      </div>
    </main>
  );
}
