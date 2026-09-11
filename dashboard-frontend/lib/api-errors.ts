import axios from "axios";

export type FieldErrors = Record<string, string>;

export type ParsedApiError = {
  message: string;
  fieldErrors?: FieldErrors;
};

// El backend devuelve dos formas de error distintas (ver GlobalExceptionHandler):
// - errores de @Valid: objeto plano campo -> mensaje, sin "message" propio.
// - el resto (404/403/401/500): { timestamp, status, error, message }.
// Esta funcion es el unico lugar que conoce esa diferencia, para no repetir
// el mismo try/catch en cada formulario del dashboard.
export function parseApiError(err: unknown): ParsedApiError {
  if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === "object") {
    const data = err.response.data as Record<string, unknown>;

    if (typeof data.message === "string") {
      return { message: data.message };
    }

    const fieldErrors = data as FieldErrors;
    const firstMessage = Object.values(fieldErrors)[0];
    if (typeof firstMessage === "string") {
      return { message: "Revisa los datos del formulario", fieldErrors };
    }
  }

  if (axios.isAxiosError(err) && !err.response) {
    return { message: "No se pudo conectar con el servidor" };
  }

  return { message: "Ocurrio un error inesperado. Intenta de nuevo." };
}
