// Decodifica el payload de un JWT sin verificar la firma.
// Sirve solo para leer datos como el username o la expiracion en codigo de
// servidor que ya confia en el token (lo emitio nuestro propio backend);
// la verificacion real de la firma la hace siempre Spring Boot.
export type JwtPayload = {
  sub: string;
  iat: number;
  exp: number;
};

export function decodeJwtPayload(token: string): JwtPayload {
  const [, payload] = token.split(".");
  const json = Buffer.from(payload, "base64url").toString("utf-8");
  return JSON.parse(json) as JwtPayload;
}
