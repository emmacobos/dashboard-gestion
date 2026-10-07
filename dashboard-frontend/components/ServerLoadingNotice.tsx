import { COLD_START_NOTICE } from "@/lib/constants";

// Compartido por los loading.tsx de /dashboard/** y por los formularios de
// login/registro mientras esperan al backend, para no repetir el mismo texto.
export default function ServerLoadingNotice() {
  return <p className="toon-panel inline-block bg-sun px-4 py-2 text-sm font-bold text-ink">{COLD_START_NOTICE}</p>;
}
