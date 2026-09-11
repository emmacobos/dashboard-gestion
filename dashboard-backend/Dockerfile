# Build stage: compila el jar con Maven (via el wrapper, sin depender de que
# la imagen de build tenga Maven instalado).
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Run stage: solo el JRE + el jar ya compilado, imagen final mas chica.
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Render setea $PORT en runtime; server.port en application.properties lo toma
# de esa variable de entorno si esta definida (ver mas abajo).
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
