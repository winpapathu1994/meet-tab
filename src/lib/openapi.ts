/**
 * OpenAPI 3.0 specification for MeetTab API.
 *
 * This is the single source of truth for API documentation.
 * Served at /api/docs as JSON and rendered at /api-docs via Swagger UI.
 */

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: { url: string; description: string }[];
  paths: Record<string, unknown>;
  components: {
    schemas: Record<string, unknown>;
    securitySchemes: Record<string, unknown>;
  };
  security?: { cookieAuth: string[] }[];
  tags: { name: string; description: string }[];
}

// ── Reusable schemas ──────────────────────────────────────────────

const AttendeeEntry = {
  type: "object",
  required: ["name", "roleId"],
  properties: {
    name: { type: "string", example: "Alice" },
    roleId: { type: "string", example: "60d5f484f1a2c8b1f8e4e1a1", description: "MongoDB _id of a Role" },
  },
};

const UserProfile = {
  type: "object",
  properties: {
    id: { type: "string", example: "60d5f484f1a2c8b1f8e4e1a2" },
    name: { type: "string", example: "Testing User" },
    email: { type: "string", format: "email", example: "user@example.com" },
  },
};

const Role = {
  type: "object",
  properties: {
    _id: { type: "string", example: "60d5f484f1a2c8b1f8e4e1a1" },
    label: { type: "string", example: "Senior Engineer" },
    hourlyRate: { type: "number", example: 75000 },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const Preset = {
  type: "object",
  properties: {
    _id: { type: "string", example: "60d5f484f1a2c8b1f8e4e1a3" },
    name: { type: "string", example: "Sprint Planning" },
    attendees: {
      type: "array",
      items: AttendeeEntry,
    },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const ErrorResponse = {
  type: "object",
  properties: {
    error: { type: "string", example: "Description of what went wrong" },
    code: {
      type: "string",
      nullable: true,
      description: "Machine-readable error code (e.g. email_not_found, invalid_password, email_exists)",
    },
  },
};

// ── Common responses ──────────────────────────────────────────────

const Unauthorized = {
  description: "Missing or invalid JWT cookie",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: { error: { type: "string", example: "Unauthorized" } },
      },
    },
  },
};

const InternalError = {
  description: "Unexpected server error",
  content: {
    "application/json": {
      schema: ErrorResponse,
    },
  },
};

// ── Paths ─────────────────────────────────────────────────────────

const paths: Record<string, unknown> = {
  // ── Auth ──────────────────────────────────────────────────────
  "/api/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register a new account",
      description: "Create a new user account and set a JWT httpOnly cookie on success.",
      operationId: "register",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password", "name"],
              properties: {
                email: { type: "string", format: "email", example: "user@example.com" },
                password: { type: "string", format: "password", minLength: 6, example: "123456" },
                name: { type: "string", example: "Testing User" },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Account created — JWT cookie set",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { user: UserProfile },
              },
            },
          },
        },
        "400": {
          description: "Missing fields or password too short",
          content: { "application/json": { schema: ErrorResponse } },
        },
        "409": {
          description: "Email already registered",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string", example: "An account with this email already exists" },
                  code: { type: "string", example: "email_exists" },
                },
              },
            },
          },
        },
        "500": InternalError,
      },
    },
  },

  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Log in to an existing account",
      description: "Authenticate with email/password and receive a JWT httpOnly cookie.",
      operationId: "login",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email", example: "user@example.com" },
                password: { type: "string", format: "password", example: "s3cret123" },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Authenticated — JWT cookie set",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { user: UserProfile },
              },
            },
          },
        },
        "400": {
          description: "Missing email or password",
          content: { "application/json": { schema: ErrorResponse } },
        },
        "401": {
          description: "Invalid credentials",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string" },
                  code: { type: "string", enum: ["email_not_found", "invalid_password"] },
                },
              },
              examples: {
                email_not_found: {
                  value: { error: "No account found with this email", code: "email_not_found" },
                },
                invalid_password: {
                  value: { error: "Invalid password", code: "invalid_password" },
                },
              },
            },
          },
        },
        "500": InternalError,
      },
    },
  },

  "/api/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Get current user session",
      description: "Return the authenticated user profile from the JWT cookie, or `{ user: null }` if not logged in.",
      operationId: "getCurrentUser",
      responses: {
        "200": {
          description: "Current user (or null)",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  user: {
                    oneOf: [UserProfile, { type: "null" }],
                  },
                },
              },
              examples: {
                authenticated: {
                  value: { user: { id: "abc123", name: "Testing User", email: "user@example.com" } },
                },
                unauthenticated: {
                  value: { user: null },
                },
              },
            },
          },
        },
        "500": InternalError,
      },
    },
  },

  "/api/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Log out and clear JWT cookie",
      description: "Clear the httpOnly JWT cookie. Works even if no cookie is set.",
      operationId: "logout",
      security: [],
      responses: {
        "200": {
          description: "Cookie cleared",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { ok: { type: "boolean", example: true } },
              },
            },
          },
        },
        "500": InternalError,
      },
    },
  },

  // ── Roles ─────────────────────────────────────────────────────
  "/api/roles": {
    get: {
      tags: ["Roles"],
      summary: "List all roles",
      description: "Public endpoint — returns all role presets sorted alphabetically by label.",
      operationId: "listRoles",
      security: [],
      responses: {
        "200": {
          description: "Array of roles",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  roles: {
                    type: "array",
                    items: Role,
                  },
                },
              },
            },
          },
        },
        "500": InternalError,
      },
    },
    post: {
      tags: ["Roles"],
      summary: "Create a new role",
      description: "Create a role with a label and hourly rate.",
      operationId: "createRole",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["label", "hourlyRate"],
              properties: {
                label: { type: "string", example: "Junior Developer" },
                hourlyRate: { type: "number", minimum: 0, example: 25000 },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Role created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { role: Role },
              },
            },
          },
        },
        "400": {
          description: "Invalid input",
          content: { "application/json": { schema: ErrorResponse } },
        },
        "401": Unauthorized,
        "500": InternalError,
      },
    },
  },

  "/api/roles/{id}": {
    put: {
      tags: ["Roles"],
      summary: "Update a role",
      description: "Partial update to a role's label and/or hourlyRate.",
      operationId: "updateRole",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB _id of the role",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                label: { type: "string", example: "Senior Developer" },
                hourlyRate: { type: "number", minimum: 0, example: 50000 },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Role updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { role: Role },
              },
            },
          },
        },
        "400": {
          description: "Invalid hourlyRate",
          content: { "application/json": { schema: ErrorResponse } },
        },
        "401": Unauthorized,
        "404": {
          description: "Role not found",
          content: { "application/json": { schema: ErrorResponse } },
        },
        "500": InternalError,
      },
    },
    delete: {
      tags: ["Roles"],
      summary: "Delete a role",
      operationId: "deleteRole",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB _id of the role",
        },
      ],
      responses: {
        "200": {
          description: "Role deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { ok: { type: "boolean", example: true } },
              },
            },
          },
        },
        "401": Unauthorized,
        "404": {
          description: "Role not found",
          content: { "application/json": { schema: ErrorResponse } },
        },
        "500": InternalError,
      },
    },
  },

  // ── Attendees ─────────────────────────────────────────────────
  "/api/attendees": {
    get: {
      tags: ["Attendees"],
      summary: "Load saved attendee session",
      description: "Return the authenticated user's last saved attendee list.",
      operationId: "loadAttendees",
      responses: {
        "200": {
          description: "Saved attendees",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  attendees: { type: "array", items: AttendeeEntry },
                },
              },
            },
          },
        },
        "401": Unauthorized,
        "500": InternalError,
      },
    },
    put: {
      tags: ["Attendees"],
      summary: "Upsert attendee session",
      description: "Save (create or update) the authenticated user's attendee list.",
      operationId: "upsertAttendees",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["attendees"],
              properties: {
                attendees: { type: "array", items: AttendeeEntry },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Attendees saved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  attendees: { type: "array", items: AttendeeEntry },
                },
              },
            },
          },
        },
        "400": {
          description: "Missing attendees array",
          content: { "application/json": { schema: ErrorResponse } },
        },
        "401": Unauthorized,
        "500": InternalError,
      },
    },
    delete: {
      tags: ["Attendees"],
      summary: "Clear saved attendee session",
      description: "Remove the authenticated user's saved attendees so next load returns an empty array.",
      operationId: "clearAttendees",
      responses: {
        "200": {
          description: "Session cleared",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { ok: { type: "boolean", example: true } },
              },
            },
          },
        },
        "401": Unauthorized,
        "500": InternalError,
      },
    },
  },

  // ── Presets ───────────────────────────────────────────────────
  "/api/presets": {
    get: {
      tags: ["Presets"],
      summary: "List all presets",
      description: "Return the authenticated user's saved attendee presets, sorted newest-first.",
      operationId: "listPresets",
      responses: {
        "200": {
          description: "Array of presets",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  presets: { type: "array", items: Preset },
                },
              },
            },
          },
        },
        "401": Unauthorized,
        "500": InternalError,
      },
    },
    post: {
      tags: ["Presets"],
      summary: "Create a new preset",
      description: "Save an attendee configuration as a named preset for quick reuse.",
      operationId: "createPreset",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "attendees"],
              properties: {
                name: { type: "string", example: "Sprint Planning" },
                attendees: { type: "array", items: AttendeeEntry },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Preset created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { preset: Preset },
              },
            },
          },
        },
        "400": {
          description: "Missing name or attendees",
          content: { "application/json": { schema: ErrorResponse } },
        },
        "401": Unauthorized,
        "500": InternalError,
      },
    },
  },

  "/api/presets/{id}": {
    put: {
      tags: ["Presets"],
      summary: "Update a preset",
      description: "Partial update to a preset's name or attendees. Scoped to the authenticated user.",
      operationId: "updatePreset",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB _id of the preset",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "Daily Standup" },
                attendees: { type: "array", items: AttendeeEntry },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Preset updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { preset: Preset },
              },
            },
          },
        },
        "401": Unauthorized,
        "404": {
          description: "Preset not found (or belongs to another user)",
          content: { "application/json": { schema: ErrorResponse } },
        },
        "500": InternalError,
      },
    },
    delete: {
      tags: ["Presets"],
      summary: "Delete a preset",
      description: "Delete a preset by ID. Scoped to the authenticated user.",
      operationId: "deletePreset",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB _id of the preset",
        },
      ],
      responses: {
        "200": {
          description: "Preset deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { ok: { type: "boolean", example: true } },
              },
            },
          },
        },
        "401": Unauthorized,
        "404": {
          description: "Preset not found",
          content: { "application/json": { schema: ErrorResponse } },
        },
        "500": InternalError,
      },
    },
  },
};

// ── Full spec ─────────────────────────────────────────────────────

const spec: OpenAPISpec = {
  openapi: "3.0.3",
  info: {
    title: "MeetTab API",
    version: "1.0.0",
    description:
      "Backend API for MeetTab — a privacy-first meeting cost timer. " +
      "All mutation endpoints (except auth) require a JWT stored as an httpOnly cookie. " +
      "The auth endpoints (register, login, logout) set or clear this cookie.",
  },
  servers: [
    { url: "http://localhost:3000", description: "Local development" },
  ],
  tags: [
    { name: "Auth", description: "Registration, login, logout, and session" },
    { name: "Roles", description: "Role presets with hourly rates" },
    { name: "Attendees", description: "Per-user attendee session" },
    { name: "Presets", description: "Named attendee configurations" },
  ],
  components: {
    schemas: {
      AttendeeEntry,
      UserProfile,
      Role,
      Preset,
      ErrorResponse,
    },
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "JWT stored as httpOnly cookie, set automatically after login/register",
      },
    },
  },
  security: [{ cookieAuth: [] }],
  paths,
};

export default spec;
