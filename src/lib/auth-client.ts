import { deviceAuthorizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/client";
import { config } from "../config/app.config.js";

export const authClient = createAuthClient({
  baseURL: config.SERVER_URL,
  plugins: [deviceAuthorizationClient()],
});

export type AuthClient = typeof authClient;
