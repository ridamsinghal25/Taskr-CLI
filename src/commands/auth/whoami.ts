import { Command } from "commander";
import { requireAuth } from "../../lib/auth-token.js";
import UserServices from "../../services/user.services.js";
import { formatText, green, red } from "../../lib/logger.js";
import { User } from "../../types/user.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import chalk from "chalk";
import { intro, outro } from "@clack/prompts";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";
import { withSpinner } from "../../lib/spinner.js";

// ============================================
// WHOAMI COMMAND
// ============================================

export async function whoamiAction() {
  intro(formatText("👤 Whoami", "white" , ["bold"]));

  const token = await requireAuth();

  if (!token?.access_token) {
    console.log(ErrorMessageEnum.NOT_AUTHENTICATED);
    process.exit(1);
  }

  const user = await withSpinner(
    "Fetching user information...",
    () => UserServices.getCurrentUser<User>()
  );

  if (isApiResponse(user)) {
    // Output user session info
        green(
          `\n👤 User: ${user.data.name}
    📧 Email: ${user.data.email}
    👤 ID: ${user.data.id}`
        , ["bold"]
        );
    outro(formatText(user.message || "User information fetched successfully", "green"));
    process.exit(0);
  }

  outro(formatText(user.errorResponse?.message || "Failed to fetch user information", "red"));
  process.exit(1);
}

export const whoami = new Command("whoami")
  .description("Show current authenticated user")
  .action(whoamiAction);
