import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import TaskService from "../../services/task.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { DeleteTasks } from "../../types/task.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { red } from "../../lib/logger.js";

export async function deleteTasksAction(taskIds: string, categoryId: string) {
  intro(chalk.bold("🗑️ Delete Tasks"));

  const ids = taskIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    console.log("No valid task IDs provided.");
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
    console.log("You are not authenticated. Please login.");
    process.exit(1);
  }

  const response = await TaskService.deleteTasksFromCategory<DeleteTasks>(
    ids,
    categoryId
  );

  if (isApiResponse(response)) {
    outro(chalk.green(response.message || "Tasks deleted successfully"));
    process.exit(0);
  }

  red(response.errorMessage || "Failed to delete tasks");
  process.exit(1);
}

export const deleteTasksCommand = new Command("delete")
  .description("Delete tasks from a category")
  .argument("<taskIds>", "Comma-separated task IDs (e.g. id1,id2,id3, ...)")
  .argument("<categoryId>", "Category ID")
  .action(deleteTasksAction);
