import { sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db/client";

export const healthRoute = new Hono();

healthRoute.get("/", async (c) => {
  try {
    await db.execute(sql`select 1`);

    return c.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database health check failed", error);

    return c.json(
      {
        status: "error",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      503,
    );
  }
});
