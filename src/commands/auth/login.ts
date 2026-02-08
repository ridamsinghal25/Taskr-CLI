import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import { logger } from "better-auth";
import chalk from "chalk";
import { Command } from "commander";
import open from "open";
import yoctoSpinner from "yocto-spinner";
import { config } from "../../config/app.config.js";
import { AuthClient, authClient } from "../../lib/auth-client.js";
import {
  getStoredToken,
  isTokenExpired,
  storeToken,
  TOKEN_FILE,
} from "../../lib/auth-token.js";
import { handleCliError } from "../../lib/errorHandler.js";
import { blue, cyan, gray, green, logErrorMessage, yellow } from "../../lib/logger.js";

export interface Token {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// ============================================
// LOGIN COMMAND
// ============================================

export async function loginAction() {
  intro(chalk.bold("🔐 Taskr Login"));
  const CLIENT_ID = config.GITHUB_CLIENT_ID;

  const clientId = CLIENT_ID;

  if (!clientId) {
    logErrorMessage("CLIENT_ID is not set in .env file");
    logErrorMessage("\n❌ Please set GITHUB_CLIENT_ID in your .env file");
    process.exit(1);
  }

  // Check if already logged in
  const existingToken = await getStoredToken();
  const expired = await isTokenExpired();

  if (existingToken && !expired) {
    const shouldReauth = await confirm({
      message: "You're already logged in. Do you want to log in again?",
      initialValue: false,
    });

    if (isCancel(shouldReauth) || !shouldReauth) {
      cancel("Login cancelled");
      process.exit(0);
    }
  }

  const spinner = yoctoSpinner({ text: "Requesting device authorization..." });
  spinner.start();

  try {
    // Request device code
    const { data, error } = await authClient.device.code({
      client_id: clientId,
      scope: "openid profile email",
    });

    spinner.stop();

    if (error || !data) {
      if (error instanceof Error) {
        logger.error(
          `Failed to request device authorization: ${error.message}`
        );
      } else {
        logger.error(
          `Failed to request device authorization: ${
            error.statusText || "Unknown error occurred"
          }`
        );
      }

      if (error?.status === 404) {
        logErrorMessage("\n❌ Device authorization endpoint not found.");
       yellow("   Make sure your auth server is running.");
      } else if (error?.status === 400) {
        logErrorMessage("\n❌ Bad request - check your CLIENT_ID configuration.");
      }

      process.exit(1);
    }

    const {
      device_code,
      user_code,
      verification_uri,
      verification_uri_complete,
      interval = 5,
      expires_in,
    } = data;

    // Display authorization instructions
    gray("");
    cyan("📱 Device Authorization Required");
    gray("");
    blue(
      `Please visit: ${chalk.underline.blue(
        verification_uri_complete || verification_uri
      )}`
    );
    green(`Enter code: ${chalk.bold.green(user_code)}`);
    gray("");

    // Ask if user wants to open browser
    const shouldOpen = await confirm({
      message: "Open browser automatically?",
      initialValue: true,
    });

    if (!isCancel(shouldOpen) && shouldOpen) {
      const urlToOpen = verification_uri_complete || verification_uri;
      await open(urlToOpen);
    }

    // Start polling
    gray(
        `Waiting for authorization (expires in ${Math.floor(
          expires_in / 60
        )} minutes)...`
    );

    const token: Token | null = await pollForToken(
      authClient,
      device_code,
      clientId,
      interval
    );

    if (token) {
      // Store the token
      const saved = await storeToken(token);

      if (!saved) {
        yellow(
          "\n⚠️  Warning: Could not save authentication token."
        );
        yellow(
          "   You may need to login again on next use."
        );
      }

      // Get user info
      const { data: session } = await authClient.getSession({
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        },
      });

      outro(
        chalk.green(
          `✅ Login successful! Welcome ${
            session?.user?.name || session?.user?.email || "User"
          }`
        )
      );

      gray(`\n📁 Token saved to: ${TOKEN_FILE}`);
      gray("   You can now use AI commands without logging in again.\n")
    }
  } catch (err) {
    spinner.stop();
    handleCliError(err, "logging in");
    process.exit(1);
  }
}

async function pollForToken(
  authClient: AuthClient,
  deviceCode: string,
  clientId: string,
  initialInterval: number
): Promise<Token | null> {
  let pollingInterval = initialInterval;
  const spinner = yoctoSpinner({ text: "", color: "cyan" });
  let dots = 0;

  return new Promise<Token | null>((resolve, reject) => {
    const poll = async () => {
      dots = (dots + 1) % 4;
      spinner.text = chalk.gray(
        `Polling for authorization${".".repeat(dots)}${" ".repeat(3 - dots)}`
      );
      if (!spinner.isSpinning) spinner.start();

      try {
        const { data, error } = await authClient.device.token({
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          device_code: deviceCode,
          client_id: clientId,
          fetchOptions: {
            headers: {
              "user-agent": `Better Auth CLI`,
            },
          },
        });

        if (data?.access_token) {
          yellow(
            `Your access token: ${data.access_token}`
          , ["bold"]
          );

          spinner.stop();
          resolve(data as Token);
          return;
        } else if (error) {
          switch (error.error) {
            case "authorization_pending":
              // Continue polling
              break;
            case "slow_down":
              pollingInterval += 5;
              break;
            case "access_denied":
              spinner.stop();
              logger.error("Access was denied by the user");
              process.exit(1);
              break;
            case "expired_token":
              spinner.stop();
              logger.error("The device code has expired. Please try again.");
              process.exit(1);
              break;
            default:
              spinner.stop();
              logger.error(`Error: ${error.error_description}`);
              process.exit(1);
          }
        }
      } catch (err) {
        spinner.stop();
        if (err instanceof Error) {
          logger.error(`Network error: ${err.message}`);
        } else {
          logger.error("Network error occurred");
        }
        process.exit(1);
      }

      setTimeout(poll, pollingInterval * 1000);
    };

    setTimeout(poll, pollingInterval * 1000);
  });
}

// ============================================
// COMMANDER SETUP
// ============================================

export const login = new Command("login")
  .description("Login to Taskr")
  .action(loginAction);
