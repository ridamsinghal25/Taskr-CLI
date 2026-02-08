import { intro, outro, multiselect } from "@clack/prompts";
import chalk from "chalk";
import clipboardy from "clipboardy";
import { Command } from "commander";
import TaskService from "../../services/task.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { isApiError } from "../../lib/typeGuard.js";
import { blueBright, red } from "../../lib/logger.js";
import { GetTasks, Task } from "../../types/task.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";

export async function getTasksAction(categoryId?: string, taskId?: string) {
  intro(chalk.bold("📋 Your Tasks"));

  const token = await requireAuth();

  if (!token?.access_token) {
    console.log(ErrorMessageEnum.NOT_AUTHENTICATED);
    process.exit(1);
  }

  // If taskId is provided, get single task
  if (taskId) {
    const response = await TaskService.getTaskById<Task>(taskId);

    if (isApiError(response)) {
      red(response.errorMessage || "Failed to get task");
      process.exit(1);
    }

    const task = response.data;
    console.log(
      `${chalk.cyan(task.name)} ${chalk.gray(`(id: ${task.id})`)}`
    );
    console.log(`  Type: ${chalk.yellow(task.type)}`);
    console.log(`  Status: ${chalk.yellow(task.status)}`);
    console.log(`  Category ID: ${chalk.gray(task.categoryId)}`);

    outro(chalk.green("✅ Task fetched"));
    process.exit(0);
  }

  // If categoryId is provided, get tasks by category
  if (categoryId) {
    const response = await TaskService.getTasksByCategoryId<GetTasks>(categoryId);

    if (isApiError(response)) {
      red(response.errorMessage || "Failed to get tasks");
      process.exit(1);
    }

    if (response.data.tasks.length === 0) {
      outro(chalk.yellow("No tasks found in this category."));
      process.exit(0);
    }

    response.data.tasks.forEach((task, index) => {
      console.log(
        `${index + 1}. ${chalk.cyan(task.name)} ${chalk.gray(
          `(id: ${task.id})`
        )} - ${chalk.yellow(task.status)} - ${chalk.yellow(task.type)}`
      );
    });

    const selectedTasks = await multiselect({
      message: "Select tasks to copy their ids",
      options: response.data.tasks.map((task) => ({
        label: `${task.name} (${task.status})`,
        value: task.id,
      })),
      required: false,
    });

    if (Array.isArray(selectedTasks) && selectedTasks.length > 0) {
      clipboardy.writeSync(selectedTasks.join(", "));

      blueBright(
        `✅ ${
          selectedTasks.length > 1 ? "Task IDs" : "Task ID"
        } copied to clipboard`
      );
    } else {
      red("❌ No tasks selected");
    }

    outro(chalk.green("✅ Tasks fetched"));
    process.exit(0);
  }

  red("Please provide either a categoryId or taskId");
  process.exit(1);
}

export const getTasks = new Command("get")
  .description("Get tasks by category ID or a single task by ID")
  .option("-c, --categoryId <categoryId>", "Category ID")
  .option("-t, --taskId <taskId>", "Task ID")
  .action((options) => getTasksAction(options.categoryId, options.taskId));
