import { intro, outro } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import TaskService from "../../services/task.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { red } from "../../lib/logger.js";
import { Task } from "../../types/task.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";

export async function moveTaskAction(taskId: string, categoryId: string) {
  intro(chalk.bold("🔄 Move Task"));

  const token = await requireAuth();

  if (!token?.access_token) {
    red(ErrorMessageEnum.NOT_AUTHENTICATED);
    process.exit(1);
  }

  const response = await TaskService.moveTaskToCategory<Task>(taskId, categoryId);

  if (isApiResponse(response)) {
    outro(chalk.green(response.message || "Task moved successfully"));
    process.exit(0);
  }

  red(response.errorMessage || "Failed to move task");
  process.exit(1);
}

export const moveTask = new Command("move")
  .description("Move a task to another category")
  .argument("<taskId>", "Task ID")
  .argument("<categoryId>", "Destination category ID")
  .action(moveTaskAction);
