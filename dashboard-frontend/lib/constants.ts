export const AUTH_COOKIE_NAME = "token";

// El backend (Render free tier) duerme tras 15 min sin trafico y tarda
// 30-50s en responder al primer request tras eso. Sin este aviso esa espera
// se ve identica a que la app se rompio.
export const COLD_START_NOTICE =
  "Conectando con el servidor, puede tardar unos segundos la primera vez...";
