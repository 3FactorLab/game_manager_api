/**
 * @file swagger.ts
 * @description Configures Swagger/OpenAPI documentation for the API.
 * Defines API metadata, security schemes, and reusable schemas.
 */
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node.js JWT Authentication API",
      version: "1.0.0",
      description:
        "API documentation for the Node.js JWT Authentication project",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:3500",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              example: "Error description",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs (updated to .ts)
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
