import { intro, outro, select } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import TaskService from "../../services/task.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { red } from "../../lib/logger.js";
import { Task, TaskType, TaskStatus, TASK_TYPES, TASK_STATUSES } from "../../types/task.js";
import { isApiResponse } from "../../lib/typeGuard.js";

export async function createTaskAction(
  name: string,
  categoryId: string,
  type?: TaskType,
  status?: TaskStatus
) {
  intro(chalk.bold("✅ Create Task"));

  const token = await requireAuth();

  if (!token?.access_token) {
    red("You are not authenticated. Please run login command first.");
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
      red("Task creation cancelled");
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
      red("Task creation cancelled");
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
    outro(chalk.green(response.message || "Task created successfully"));
    process.exit(0);
  }

  red(response.errorMessage || "Failed to create task");
  process.exit(1);
}

export const createTask = new Command("create")
  .description("Create a new task")
  .argument("<name>", "Task name")
  .argument("<categoryId>", "Category ID")
  .option("-t, --type <type>", "Task type (normal|critical)", "normal")
  .option("-s, --status <status>", "Task status (pending|in_progress|done|archived)", "pending")
  .action(createTaskAction);
