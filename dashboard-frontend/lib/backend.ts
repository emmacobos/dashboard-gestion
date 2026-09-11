// URL del backend Spring Boot. Solo se usa en codigo de servidor
// (Route Handlers y Server Components), nunca llega al navegador.
export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";
