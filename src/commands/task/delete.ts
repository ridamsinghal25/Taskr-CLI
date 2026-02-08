import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import { Command } from "commander";
import TaskService from "../../services/task.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { DeleteTasks } from "../../types/task.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { formatText } from "../../lib/logger.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";
import { withSpinner } from "../../lib/spinner.js";

export async function deleteTasksAction(taskIds: string, categoryId: string) {
  intro(formatText("🗑️ Delete Tasks", "white" , ["bold"]));

  const ids = taskIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    outro(formatText("No valid task IDs provided.", "yellow"));
    process.exit(1);
  }

  const shouldDelete = await confirm({
    message: "Are you sure you want to delete these tasks?",
    initialValue: false,
  });

  if (isCancel(shouldDelete) || !shouldDelete) {
    cancel("Delete cancelled");
    process.exit(0);
  }

  const token = await requireAuth();

  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  const response = await withSpinner(
    "Deleting tasks...",
    () => TaskService.deleteTasksFromCategory<DeleteTasks>(
      ids,
      categoryId
    )
  );

  if (isApiResponse(response)) {
    outro(formatText(response.message || "Tasks deleted successfully", "green"));
    process.exit(0);
  }

  outro(formatText(response.errorResponse?.message || "Failed to delete tasks", "red"));
  process.exit(1);
}

export const deleteTasksCommand = new Command("delete")
  .description("Delete tasks from a category")
  .argument("<taskIds>", "Comma-separated task IDs (e.g. id1,id2,id3, ...)")
  .argument("<categoryId>", "Category ID")
  .action(deleteTasksAction);
