import { intro, outro } from "@clack/prompts";
import { Command } from "commander";
import TaskService from "../../services/task.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { formatText } from "../../lib/logger.js";
import { Task } from "../../types/task.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";
import { withSpinner } from "../../lib/spinner.js";

export async function moveTaskAction(taskId: string, categoryId: string) {
  intro(formatText("🔄 Move Task", "white" , ["bold"]));

  const token = await requireAuth();

  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  const response = await withSpinner(
    "Moving task...",
    () => TaskService.moveTaskToCategory<Task>(taskId, categoryId)
  );

  if (isApiResponse(response)) {
    outro(formatText(response.message || "Task moved successfully", "green"));
    process.exit(0);
  }

  outro(formatText(response.errorResponse?.message || "Failed to move task", "red"));
  process.exit(1);
}

export const moveTask = new Command("move")
  .description("Move a task to another category")
  .argument("<taskId>", "Task ID")
  .argument("<categoryId>", "Destination category ID")
  .action(moveTaskAction);
