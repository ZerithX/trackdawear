import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { errorResponse, successResponse } from "../../shared/response";
import { categoryParamsSchema, createCategorySchema } from "./categories.schema";
import { categoryService } from "./categories.service";

export const categoryRoute = new Hono();

categoryRoute.post(
  "/",
  zValidator("json", createCategorySchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse("VALIDATION_ERROR", "Invalid request body", result.error.issues),
        400,
      );
    }
  }),
  async (c) => {
    const input = c.req.valid("json");
    const category = await categoryService.create(input);
    return c.json(successResponse(category), 201);
  },
);

categoryRoute.get("/", async (c) => {
  const categories = await categoryService.list();
  return c.json(successResponse(categories));
});

categoryRoute.get(
  "/:id",
  zValidator("param", categoryParamsSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse("VALIDATION_ERROR", "Invalid category id", result.error.issues),
        400,
      );
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const category = await categoryService.getById(id);
    return c.json(successResponse(category));
  },
);
