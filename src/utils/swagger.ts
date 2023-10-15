import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dokumentasi API KUD",
      version: "1.0.0",
      description: "API untuk aplikasi KUD",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      }
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
}

export const specs = swaggerJsdoc(options);