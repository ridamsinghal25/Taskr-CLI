import { intro, outro, select } from "@clack/prompts";
import { Command } from "commander";
import TaskService from "../../services/task.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { formatText } from "../../lib/logger.js";
import { Task, TaskType, TaskStatus, TASK_TYPES, TASK_STATUSES } from "../../types/task.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";

export async function createTaskAction(
  name: string,
  categoryId: string,
  type?: TaskType,
  status?: TaskStatus
) {
    intro(formatText("✅ Create Task", "white" , ["bold"]));

  const token = await requireAuth();

  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  let taskType: TaskType = type ?? TaskType.Normal;
  let taskStatus: TaskStatus = status ?? TaskStatus.Pending;

  if (!type) {
    const selectedType = await select({
      message: "Select task type",
      options: TASK_TYPES.map((t) => ({
        value: t,
        label: t.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        })),
    });

    if (typeof selectedType === "symbol") {
      outro(formatText("Task creation cancelled", "yellow"));
      process.exit(1);
    }

    taskType = selectedType as TaskType;
  }

  if (!status) {
    const selectedStatus = await select({
      message: "Select task status",
      options: TASK_STATUSES.map((s) => ({
        value: s,
        label: s.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      })),
    });

    if (typeof selectedStatus === "symbol") {
      outro(formatText("Task creation cancelled", "yellow"));
      process.exit(1);
    }

    taskStatus = selectedStatus as TaskStatus;
  }

  const response = await TaskService.createTask<Task>(
    name,
    taskType,
    taskStatus,
    categoryId
  );

  if (isApiResponse(response)) {
    outro(formatText(response.message || "Task created successfully", "green"));
    process.exit(0);
  }

  outro(formatText(response.errorResponse?.message || "Failed to create task", "red"));
  process.exit(1);
}

export const createTask = new Command("create")
  .description("Create a new task")
  .argument("<name>", "Task name")
  .argument("<categoryId>", "Category ID")
  .option("-t, --type <type>", "Task type (normal|critical)", "normal")
  .option("-s, --status <status>", "Task status (pending|in_progress|done|archived)", "pending")
  .action(createTaskAction);
