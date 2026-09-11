# Dashboard Backend

API REST para el "Dashboard de Gestion con Autenticacion de Usuarios".

## Stack

- Java 21
- Spring Boot 3.3.4
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL

## Estructura de paquetes

```
com.emmacobos.dashboard
├── config       -> configuracion de Spring (CORS, beans, Swagger, etc.)
├── controller   -> endpoints REST
├── service      -> logica de negocio
├── repository   -> interfaces JpaRepository
├── entity       -> entidades JPA (tablas)
├── dto          -> objetos de transferencia (requests/responses)
├── security     -> filtros JWT, UserDetailsService, SecurityConfig
└── exception    -> manejo centralizado de errores (@ControllerAdvice)
```

## Como correrlo

1. Crear la base de datos en PostgreSQL:
   ```sql
   CREATE DATABASE dashboard_db;
   ```
2. Configurar variables de entorno (o dejar los valores por defecto de desarrollo en `application.properties`):
   - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
   - `JWT_SECRET`, `JWT_EXPIRATION_MS`
3. Ejecutar:
   ```bash
   ./mvnw spring-boot:run
   ```

La API queda disponible en `http://localhost:8080`.
