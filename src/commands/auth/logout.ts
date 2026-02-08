import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import { Command } from "commander";
import { clearStoredToken, getStoredToken } from "../../lib/auth-token.js";
import { formatText } from "../../lib/logger.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";

// ============================================
// LOGOUT COMMAND
// ============================================

export async function logoutAction(..._args: any[]) {
  intro(formatText("👋 Logout", "white" , ["bold"]));

  const token = await getStoredToken();

  if (!token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "yellow"));
    process.exit(0);
  }

  const shouldLogout = await confirm({
    message: "Are you sure you want to logout?",
    initialValue: false,
  });

  if (isCancel(shouldLogout) || !shouldLogout) {
    cancel("Logout cancelled");
    process.exit(0);
  }

  const cleared = await clearStoredToken();

  if (cleared) {
    outro(formatText("✅ Successfully logged out!", "green"));
  } else {
    outro(formatText("⚠️  Could not clear token file.", "yellow"));
  }
}

// ============================================
// COMMANDER SETUP
// ============================================

export const logout = new Command("logout")
  .description("Logout and clear stored credentials")
  .action(logoutAction);
