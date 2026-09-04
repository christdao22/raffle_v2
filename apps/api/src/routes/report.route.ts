import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { raffleReportSchema } from "@raffle_v2/shared";
import { getRaffleReportHandler } from "../controller/report.controller";
import type { AppEnv } from "../lib/context";

const app = new OpenAPIHono<AppEnv>();

const reportDateSchema = z.string().date();

export const getRaffleReportRoute = createRoute({
  method: "get",
  path: "/{raffleId}",
  tags: ["Reports"],
  summary: "Get a raffle results report",
  request: {
    params: z.object({
      raffleId: z.string(),
    }),
    query: z.object({
      startDate: reportDateSchema.optional(),
      endDate: reportDateSchema.optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: raffleReportSchema,
        },
      },
      description: "Completed raffle report data",
    },
  },
});

app.openapi(getRaffleReportRoute, getRaffleReportHandler);

export default app;
