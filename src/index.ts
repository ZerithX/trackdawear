import { app } from "./app";
import { env } from "./config/env";

export default {
  port: env.PORT,
  fetch: app.fetch,
};

console.log(`TrackDaWear API running on port ${env.PORT}`);
