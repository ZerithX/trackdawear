import { Hono } from "hono";
import { errorHandler } from "./middleware/error-handler";
import { assetRoute } from "./modules/assets/asset.route";
import { categoryRoute } from "./modules/categories/categories.route";
import { healthRoute } from "./modules/health/health.route";
import { loanRoute } from "./modules/loans/loans.route";
import { userRoute } from "./modules/users/users.route";
import { errorResponse } from "./shared/response";

export const app = new Hono();

app.get("/", (c) => {
  return c.json({
    name: "TrackDaWear API",
    status: "running",
  });
});

app.route("/health", healthRoute);
app.route("/users", userRoute);
app.route("/categories", categoryRoute);
app.route("/assets", assetRoute);
app.route("/loans", loanRoute);

app.notFound((c) =>
  c.json(errorResponse("NOT_FOUND", "Route was not found"), 404),
);

app.onError(errorHandler);

export default app;
