FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

COPY Backend/backend/pom.xml app/
COPY Backend/backend/src app/src


WORKDIR /app/backend

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21

WORKDIR /app

COPY --from=build /app/backend/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]