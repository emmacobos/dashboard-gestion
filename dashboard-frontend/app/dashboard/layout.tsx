import Link from "next/link";
import LogoutButton from "./LogoutButton";

// El backend en Render (free tier) puede tardar mas de 2 minutos en
// despertar tras una inactividad larga (medido: ~122s en el peor caso
// observado). maxDuration en un layout se aplica a todas las rutas
// anidadas (/dashboard/**), asi que alcanza con declararlo una sola vez
// aca en vez de en cada page.tsx que le pega al backend. Mismo valor que
// dashboard-frontend/vercel.json para las rutas de app/api/**.
export const maxDuration = 200;

// Header comun a todas las pantallas de /dashboard/**: evita repetir el nav
// y el boton de logout en cada page.tsx.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky to-sky-deep">
      <header className="border-b-[3px] border-ink bg-paper">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <nav className="flex items-center gap-5">
            <Link href="/dashboard" className="font-display text-lg font-extrabold text-ink">
              🧭 Dashboard
            </Link>
            <Link href="/dashboard/projects" className="toon-pill bg-cloud text-ink">
              Proyectos
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
