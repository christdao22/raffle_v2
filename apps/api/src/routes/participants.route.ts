import {
  createParticipantSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  participantIdParamSchema,
  participantSchema,
  updateParticipantSchema,
} from "@raffle_v2/shared";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  createParticipant,
  deleteParticipant,
  getParticipant,
  listParticipant,
  updateParticipant,
} from "../controller/participants.controller";
import type { AppEnv } from "../lib/context";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const app = new OpenAPIHono<AppEnv>();

const errorSchema = z.object({ error: z.string() });

export const participantListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
});

export const participantListRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Participants"],
  middleware: [requireAuth] as const,
  request: { query: participantListQuerySchema },
  responses: {
    200: {
      content: { "application/json": { schema: paginatedResponseSchema(participantSchema) } },
      description: "Paginated list of participants",
    },
    401: { content: { "application/json": { schema: errorSchema } }, description: "Unauthorized" },
  },
});

export const participantGetRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Participants"],
  middleware: [requireAuth] as const,
  request: { params: participantIdParamSchema },
  responses: {
    200: {
      content: { "application/json": { schema: participantSchema } },
      description: "The participant",
    },
    404: { content: { "application/json": { schema: errorSchema } }, description: "Not found" },
  },
});

export const participantCreateRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Participants"],
  middleware: [requireAuth, requireRole("admin")] as const,
  request: {
    body: { content: { "application/json": { schema: createParticipantSchema } } },
  },
  responses: {
    201: {
      content: { "application/json": { schema: participantSchema } },
      description: "Created participant",
    },
    403: { content: { "application/json": { schema: errorSchema } }, description: "Forbidden" },
    409: {
      // Add this for conflict/duplicate
      content: { "application/json": { schema: errorSchema } },
      description: "Conflict - Duplicate entry",
    },
  },
});

export const participantUpdateRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Participants"],
  middleware: [requireAuth, requireRole("admin")] as const,
  request: {
    params: participantIdParamSchema,
    body: { content: { "application/json": { schema: updateParticipantSchema } } },
  },
  responses: {
    200: {
      content: { "application/json": { schema: participantSchema } },
      description: "Updated participant",
    },
    404: { content: { "application/json": { schema: errorSchema } }, description: "Not found" },
  },
});

export const participantDeleteRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Participants"],
  middleware: [requireAuth, requireRole("admin")] as const,
  request: { params: participantIdParamSchema },
  responses: {
    204: { description: "Deleted" },
    404: { content: { "application/json": { schema: errorSchema } }, description: "Not found" },
  },
});

const routes = app
  .openapi(participantListRoute, listParticipant)
  .openapi(participantGetRoute, getParticipant)
  .openapi(participantCreateRoute, createParticipant)
  .openapi(participantUpdateRoute, updateParticipant)
  .openapi(participantDeleteRoute, deleteParticipant);

export default routes;

