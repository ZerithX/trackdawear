import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { errorResponse, successResponse } from "../../shared/response";
import {
  assetParamsSchema,
  assetQuerySchema,
  createAssetSchema,
  updateAssetSchema,
} from "./asset.schema";
import { assetService } from "./asset.service";

export const assetRoute = new Hono();

assetRoute.post(
  "/",
  zValidator("json", createAssetSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse("VALIDATION_ERROR", "Invalid request body", result.error.issues),
        400,
      );
    }
  }),
  async (c) => {
    const input = c.req.valid("json");
    const asset = await assetService.create(input);
    return c.json(successResponse(asset), 201);
  },
);

assetRoute.get(
  "/",
  zValidator("query", assetQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse("VALIDATION_ERROR", "Invalid query parameters", result.error.issues),
        400,
      );
    }
  }),
  async (c) => {
    const query = c.req.valid("query");
    const assets = await assetService.list(query);
    return c.json(successResponse(assets));
  },
);

assetRoute.get(
  "/:id",
  zValidator("param", assetParamsSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse("VALIDATION_ERROR", "Invalid asset id", result.error.issues),
        400,
      );
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const asset = await assetService.getById(id);
    return c.json(successResponse(asset));
  },
);

assetRoute.patch(
  "/:id",
  zValidator("param", assetParamsSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse("VALIDATION_ERROR", "Invalid asset id", result.error.issues),
        400,
      );
    }
  }),
  zValidator("json", updateAssetSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse("VALIDATION_ERROR", "Invalid request body", result.error.issues),
        400,
      );
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    const asset = await assetService.update(id, input);
    return c.json(successResponse(asset));
  },
);
