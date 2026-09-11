"use client";

import { useRouter } from "next/navigation";
import axios from "axios";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await axios.post("/api/logout");
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300"
    >
      Cerrar sesion
    </button>
  );
}
