# Dashboard de Gestion con Autenticacion — Especificacion del Proyecto

Este archivo es la especificacion tecnica completa del proyecto. Ningun paso esta
implementado todavia — el objetivo es que vos (Claude Code) construyas todo el
proyecto de punta a punta, paso por paso, siguiendo este documento.

**Antes de escribir codigo**: revisa que hay en el repo (`dashboard-project/`) para
no duplicar ni pisar nada que ya exista. Si una carpeta o archivo de los que se
piden mas abajo ya existe, ajustalo en vez de recrearlo desde cero.

## Objetivo

Proyecto portfolio para conseguir el primer trabajo como Desarrolladora Full Stack.
Es una app full-stack desacoplada:

- **Backend**: Java 21 + Spring Boot 3.3.4, Spring Security (JWT), Spring Data JPA, PostgreSQL.
- **Frontend**: Next.js (App Router) + Tailwind CSS + Axios.

## Estructura del repo

```
dashboard-project/
├── CLAUDE.md              <- este archivo
├── dashboard-backend/     <- proyecto Maven de Spring Boot
└── dashboard-frontend/    <- proyecto Next.js (se crea recien en el Paso 3)
```

## Plan de 4 pasos (ninguno hecho todavia)

1. Backend — Autenticacion y seguridad (JWT, roles USER/ADMIN).
2. Backend — Logica de negocio del dashboard (entidades de dominio, CRUD, DTOs, validaciones, excepciones).
3. Frontend — Estructura Next.js + consumo de auth (login/registro, interceptor Axios con JWT, rutas protegidas).
4. Frontend — Dashboard UI + integracion completa + deploy.

Andá paso por paso. No avances al siguiente paso sin haber verificado que el
anterior compila y corre (`mvn spring-boot:run` en el backend; `npm run dev`
en el frontend cuando exista).

---

## Paso 0 — Esqueleto base del backend (si `dashboard-backend/` no existe o esta vacio)

Crear un proyecto Maven Spring Boot con:

- **Parent**: `org.springframework.boot:spring-boot-starter-parent:3.3.4`
- **Java**: 21
- **groupId**: `com.emmacobos` — **artifactId**: `dashboard-backend` — **paquete base**: `com.emmacobos.dashboard`
- **Dependencias**: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`,
  `spring-boot-starter-validation`, `org.postgresql:postgresql` (runtime), `io.jsonwebtoken:jjwt-api:0.12.6`,
  `io.jsonwebtoken:jjwt-impl:0.12.6` (runtime), `io.jsonwebtoken:jjwt-jackson:0.12.6` (runtime),
  `org.projectlombok:lombok` (optional), `spring-boot-devtools` (runtime, optional),
  `spring-boot-starter-test` + `spring-security-test` (test).
- **Subpaquetes** dentro de `com.emmacobos.dashboard`: `config`, `controller`, `service`, `repository`,
  `entity`, `dto`, `security`, `exception`.
- **`application.properties`**: leer todo de variables de entorno con defaults de desarrollo:
  - `spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/dashboard_db}`
  - `spring.datasource.username=${DB_USERNAME:postgres}`
  - `spring.datasource.password=${DB_PASSWORD:postgres}`
  - `spring.jpa.hibernate.ddl-auto=update` (es desarrollo; si mas adelante se agrega Flyway/Liquibase, sacar esto)
  - `spring.jpa.show-sql=true`
  - `jwt.secret=${JWT_SECRET:<un secreto largo de desarrollo>}` (minimo 32 caracteres, lo pide HS256)
  - `jwt.expiration-ms=${JWT_EXPIRATION_MS:86400000}`
  - `app.admin.username=${ADMIN_USERNAME:admin}`, `app.admin.email=${ADMIN_EMAIL:admin@dashboard.local}`,
    `app.admin.password=${ADMIN_PASSWORD:admin123}`
- `.gitignore` estandar de Maven/Java (target/, .idea/, *.iml, .env, etc.)

Verificar que `mvn spring-boot:run` levanta sin errores antes de seguir.

---

## Paso 1 — Autenticacion y seguridad (JWT, roles USER/ADMIN)

Roles como **entidad separada** (no un simple string en `User`), relacion `@ManyToMany`
con tabla intermedia `user_roles`. Es mas flexible si mas adelante se agregan mas roles.

- **`entity/`**
  - `ERole`: enum `ROLE_USER`, `ROLE_ADMIN`.
  - `Role`: `@Entity`, id autoincremental, campo `name` (`ERole`, `@Enumerated(EnumType.STRING)`, unico).
  - `User`: `@Entity`, `id`, `username` y `email` unicos, `password` (hasheada), `Set<Role> roles`
    (`@ManyToMany(fetch = FetchType.EAGER)`, tabla `user_roles`). Validaciones `@NotBlank`/`@Email`/`@Size`.
- **`repository/`**: `UserRepository` (`findByUsername`, `existsByUsername`, `existsByEmail`),
  `RoleRepository` (`findByName(ERole)`).
- **`dto/`**: `RegisterRequest` (username, email, password + validaciones), `LoginRequest` (username, password),
  `JwtResponse` (token, type="Bearer", id, username, email, roles), `MessageResponse` (message).
- **`security/`**:
  - `JwtUtils`: genera y valida el JWT con la libreria **jjwt 0.12.x** (API nueva: `Jwts.builder().subject(...).issuedAt(...).expiration(...).signWith(key).compact()`
    y `Jwts.parser().verifyWith(key).build().parseSignedClaims(token)` — **no** uses la API vieja `parserBuilder()`/`setSubject()`, esta deprecada en 0.12.x).
    La key sale de `Keys.hmacShaKeyFor(jwtSecret.getBytes())`.
  - `UserDetailsImpl`: adapta `User` a `UserDetails` de Spring Security (metodo estatico `build(User)`).
  - `UserDetailsServiceImpl`: `loadUserByUsername` busca por username y lanza `UsernameNotFoundException` si no existe.
  - `AuthTokenFilter` (`OncePerRequestFilter`): lee el header `Authorization: Bearer <token>`, valida el JWT
    y setea la autenticacion en el `SecurityContextHolder`.
  - `AuthEntryPointJwt` (`AuthenticationEntryPoint`): devuelve 401 en JSON (no la pagina de error default de Spring).
- **`config/`**:
  - `SecurityConfig`: `SecurityFilterChain` con CSRF deshabilitado, sesiones `STATELESS`, `/api/auth/**` y
    `/api/test/all` publicos, el resto requiere autenticacion. `@EnableMethodSecurity` para poder usar
    `@PreAuthorize("hasRole('ADMIN')")` en los controllers. `BCryptPasswordEncoder` como bean.
  - `DataInitializer` (`CommandLineRunner`): al arrancar, crea los roles `ROLE_USER`/`ROLE_ADMIN` si no existen,
    y crea un usuario admin de prueba (credenciales desde `app.admin.*`) si todavia no hay ninguno con ese username.
    Esto evita tener que dar de alta un admin a mano para poder probar `/api/test/admin`.
- **`controller/`**:
  - `AuthController` (`/api/auth`): `POST /register` (**siempre** asigna `ROLE_USER`, nunca un rol que venga
    del body — si el cliente pudiera elegir su rol, cualquiera se autoasignaria ADMIN), `POST /login`
    (autentica con `AuthenticationManager`, devuelve `JwtResponse`).
  - `TestController` (`/api/test`): `GET /all` (publico), `GET /user` (`@PreAuthorize` USER o ADMIN),
    `GET /admin` (`@PreAuthorize` solo ADMIN). Sirve para verificar rapido que los permisos funcionan;
    se puede borrar cuando haya controllers de negocio reales.
- **`exception/`**: `GlobalExceptionHandler` (`@RestControllerAdvice`): captura `MethodArgumentNotValidException`
  (errores de `@Valid`, devuelve mapa campo->mensaje), `BadCredentialsException` (401), y `Exception` generica (500).
  Todo en JSON, nunca HTML.

**Verificacion del Paso 1** (con la app corriendo y Postgres levantado):

```bash
# Registrar un usuario
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" \
  -d '{"username":"emma","email":"emma@test.com","password":"123456"}'

# Login como admin (el que crea DataInitializer)
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# devuelve un token JWT

# Endpoint protegido con ese token
curl http://localhost:8080/api/test/admin -H "Authorization: Bearer <token>"

# Sin token deberia dar 401
curl http://localhost:8080/api/test/admin
```

Los 4 casos tienen que comportarse como se espera antes de pasar al Paso 2.

---

## Paso 2 — Logica de negocio del dashboard

Todavia no esta definido el dominio de negocio (que es lo que se va a "gestionar":
proyectos, tareas, productos, clientes, etc.). **Si no queda claro por el contexto,
preguntale a la usuaria antes de escribir codigo de este paso.**

Una vez definido el dominio, seguir el mismo estilo del Paso 1: entidades JPA propias,
repositorios, DTOs separados de las entities (nunca exponer la entity JPA directo en
la API), validacion con Jakarta Validation, servicios con la logica de negocio,
controllers finos que delegan a `service/`, respuestas de error consistentes via
`GlobalExceptionHandler`. Los endpoints de escritura (crear/editar/borrar) deberian
requerir autenticacion como minimo; evaluar si algo requiere `@PreAuthorize` de ADMIN.

## Paso 3 — Frontend Next.js + autenticacion

Proyecto Next.js (App Router) + Tailwind en `dashboard-frontend/`.

**Decision tomada: el JWT se guarda en una cookie httpOnly, nunca en localStorage
ni expuesto al JS del navegador.** Esto cambia la arquitectura de las llamadas a la
API respecto al patron "interceptor de Axios que agrega el header": como el
JavaScript del cliente no puede leer una cookie httpOnly, el navegador nunca le
habla directo al backend Spring Boot (`localhost:8080`) — todo pasa por el
servidor de Next, que es quien conoce el token.

- **`app/api/login/route.ts`** (Route Handler): recibe username/password del
  formulario de login (client component), llama al backend Spring Boot
  (`POST /api/auth/login`), y si es exitoso setea el JWT en una cookie
  `httpOnly: true`, `secure: true` en produccion, `sameSite: 'lax'`, con la misma
  expiracion que `jwt.expiration-ms`. Devuelve al cliente solo lo que necesite
  mostrar (ej. username, roles) — **nunca el token**.
- **`app/api/logout/route.ts`**: borra la cookie.
- **`app/api/register/route.ts`**: proxea el registro al backend (no necesita cookie,
  no hay sesion todavia).
- **Proxy para el resto de la API** (`app/api/projects/route.ts`,
  `app/api/tasks/route.ts`, etc., o un catch-all `app/api/[...path]/route.ts`):
  lee la cookie del request entrante con `cookies()` de `next/headers`, arma el
  header `Authorization: Bearer <token>` y reenvia la llamada al backend Spring
  Boot, devolviendo la respuesta tal cual. Los client components (formularios,
  botones que crean/editan/borran) usan Axios apuntando a estas rutas propias de
  Next (`/api/projects`, `/api/tasks`) — **nunca** a `localhost:8080` directo.
- Los **Server Components** que solo necesitan leer datos para renderizar pueden
  saltarse el proxy y llamar directo al backend desde el servidor, leyendo la
  cookie con `cookies()` y agregando el header ahi mismo.
- **`middleware.ts`**: si la cookie no esta presente, redirige `/dashboard/**` a
  `/login`.
- Paginas de login y registro (client components) que consumen los Route Handlers
  de arriba, no la API de Spring Boot directamente.

## Paso 4 — Dashboard UI + integracion completa + deploy

Vistas del CRUD del Paso 2 (tablas, formularios, manejo de loading/error). Deploy:
backend en Render o Railway (con su Postgres administrado), frontend en Vercel.
Variables de entorno de produccion (JWT secret real, URL de la API) nunca hardcodeadas.

---

## Convenciones del proyecto

- Idioma de comentarios, mensajes de commit y respuestas a la usuaria: **espanol**.
- Nombres de clases/metodos/variables: ingles (convencion estandar de Java/JS).
- Sin acentos en comentarios/strings de codigo Java (evita problemas de encoding en
  consola de Windows) — escribir "no esta" en vez de "no está".
- Lombok esta disponible en el backend: usar `@Getter/@Setter/@RequiredArgsConstructor`
  en vez de escribir boilerplate a mano.
- Nunca hardcodear credenciales reales (DB, JWT secret) en archivos que se commitean.
