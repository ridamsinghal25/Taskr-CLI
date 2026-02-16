import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import { Command } from "commander";
import TaskService from "../../services/task.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { DeleteTasks } from "../../types/task.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { formatText } from "../../lib/logger.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";
import { withSpinner } from "../../lib/spinner.js";

export async function deleteTasksAction(categoryName: string, taskNames: string[]) {
  intro(formatText(`🗑️ Delete Tasks in ${categoryName}`, "white" , ["bold"]));

  if (!categoryName) {
    outro(formatText("Category name is required", "yellow"));
    process.exit(1);
  }

  const names = taskNames
    .map((name) => name.trim().replace(",", ""))
    .filter(Boolean);

  if (names.length === 0) {
    outro(formatText("No valid task IDs provided.", "yellow"));
    process.exit(1);
  }

  if (!categoryName) {
    outro(formatText("Category name is required", "yellow"));
    process.exit(1);
  }

  const shouldDelete = await confirm({
    message: `Are you sure you want to delete these tasks: ${names.join(", ")}?`,
    initialValue: true,
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
    () => TaskService.deleteTasksByName<DeleteTasks>(
      categoryName,
      names,
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
  .argument("<categoryName>", "Category Name")
  .argument("<taskNames...>", "Comma-separated task names (e.g. name1,name2,name3, ...)")
  .showHelpAfterError()
  .action(deleteTasksAction);
