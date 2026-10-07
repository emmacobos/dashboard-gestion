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
    <button onClick={handleLogout} className="toon-btn toon-btn-secondary">
      Cerrar sesión 👋
    </button>
  );
}
