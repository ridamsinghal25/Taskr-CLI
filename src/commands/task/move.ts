import { intro, outro } from "@clack/prompts";
import { Command } from "commander";
import TaskService from "../../services/task.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { formatText } from "../../lib/logger.js";
import { Task } from "../../types/task.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";
import { withSpinner } from "../../lib/spinner.js";

export async function moveTaskAction(taskName: string, categoryName: string, newCategoryName: string) {
  intro(formatText(`🔄 Moving task ${taskName} from ${categoryName} to ${newCategoryName}`, "white" , ["bold"]));

  if (!taskName) {
    outro(formatText("Task name is required", "yellow"));
    process.exit(1);
  }

  if (!categoryName) {
    outro(formatText("Category name is required", "yellow"));
    process.exit(1);
  }

  if (!newCategoryName) {
    outro(formatText("New category name is required", "yellow"));
    process.exit(1);
  }

  const token = await requireAuth();

  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  const response = await withSpinner(
    "Moving task...",
    () => TaskService.moveTaskToCategoryByName<Task>(taskName, categoryName, newCategoryName)
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
  .argument("<taskName>", "Task Name")
  .argument("<categoryName>", "Destination category Name")
  .argument("<newCategoryName>", "New category Name")
  .showHelpAfterError()
  .action(moveTaskAction);
