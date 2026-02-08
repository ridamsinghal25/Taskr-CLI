import { intro, outro } from "@clack/prompts";
import { Command } from "commander";
import TaskService from "../../services/task.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { formatText } from "../../lib/logger.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { Task, TaskType, TaskStatus } from "../../types/task.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";

export async function updateTaskAction(
  taskId: string,
  categoryId: string,
  name?: string,
  type?: TaskType,
  status?: TaskStatus
) {
  intro(formatText("✏️ Update Task", "white" , ["bold"]));

  const token = await requireAuth();

  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  const updates: Partial<{
    name: string;
    type: TaskType;
    status: TaskStatus;
  }> = {};

  if (name) {
    updates.name = name;
  }

  if (type) {
    updates.type = type;
  }

  if (status) {
    updates.status = status;
  }

  if (Object.keys(updates).length === 0) {
    outro(formatText("No updates provided", "yellow"));
    process.exit(1);
  }

  const response = await TaskService.updateTask<Partial<Task>>(
    taskId,
    categoryId,
    updates
  );

  if (isApiResponse(response)) {
    outro(formatText(response.message || "Task updated successfully", "green"));
    process.exit(0);
  }

  outro(formatText(response.errorResponse?.message || "Failed to update task", "red"));
  process.exit(1);
}

export const updateTaskCommand = new Command("update")
  .description("Update a task")
  .argument("<taskId>", "Task ID")
  .argument("<categoryId>", "Category ID")
  .option("-n, --name <name>", "New task name")
  .option("-t, --type <type>", "Task type (normal|critical)")
  .option("-s, --status <status>", "Task status (pending|in_progress|done|archived)")
  .action((taskId, categoryId, options) =>
    updateTaskAction(taskId, categoryId, options.name, options.type, options.status)
  );
