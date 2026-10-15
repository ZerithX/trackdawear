import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { errorResponse, successResponse } from "../../shared/response";
import { createUserSchema } from "./users.schema";
import { userService } from "./users.service";

export const userRoute = new Hono();

userRoute.post(
  "/",
  zValidator("json", createUserSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse("VALIDATION_ERROR", "Invalid request body", result.error.issues),
        400,
      );
    }
  }),
  async (c) => {
    const input = c.req.valid("json");
    const user = await userService.create(input);
    return c.json(successResponse(user), 201);
  },
);

userRoute.get("/", async (c) => {
  const users = await userService.list();
  return c.json(successResponse(users));
});
