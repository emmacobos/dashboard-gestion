import Link from "next/link";
import LogoutButton from "./LogoutButton";

// El backend en Render (free tier) puede tardar 30-50s en despertar en el
// primer request tras estar inactivo. maxDuration en un layout se aplica a
// todas las rutas anidadas (/dashboard/**), asi que alcanza con declararlo
// una sola vez aca en vez de en cada page.tsx que le pega al backend.
export const maxDuration = 60;

// Header comun a todas las pantallas de /dashboard/**: evita repetir el nav
// y el boton de logout en cada page.tsx.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-8 py-4">
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-semibold text-gray-900">
              Dashboard
            </Link>
            <Link href="/dashboard/projects" className="text-sm text-gray-600 hover:text-gray-900">
              Proyectos
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-8 py-8">{children}</main>
    </div>
  );
}
