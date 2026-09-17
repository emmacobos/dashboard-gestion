import { COLD_START_NOTICE } from "@/lib/constants";

// Compartido por los loading.tsx de /dashboard/** y por los formularios de
// login/registro mientras esperan al backend, para no repetir el mismo texto.
export default function ServerLoadingNotice() {
  return <p className="text-sm text-gray-500">{COLD_START_NOTICE}</p>;
}
