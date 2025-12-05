# === Build stage: use Maven + Java 21 ===
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy everything in backend/ into the image
COPY . .

# Build the JAR (skip tests to keep it fast)
RUN mvn clean package -DskipTests

# === Run stage: minimal Java 21 runtime ===
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Spring Boot default port
EXPOSE 8080

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
