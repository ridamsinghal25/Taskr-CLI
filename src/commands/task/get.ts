import { intro, outro, multiselect } from "@clack/prompts";
import chalk from "chalk";
import clipboardy from "clipboardy";
import { Command } from "commander";
import TaskService from "../../services/task.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { isApiError } from "../../lib/typeGuard.js";
import { blueBright, formatText, red } from "../../lib/logger.js";
import { GetTasks, Task } from "../../types/task.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";

export async function getTasksAction(categoryId?: string, taskId?: string) {
  intro(formatText("📋 Your Tasks", "white" , ["bold"]));

  const token = await requireAuth();

  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  // If taskId is provided, get single task
  if (taskId) {
    const response = await TaskService.getTaskById<Task>(taskId);

    if (isApiError(response)) {
      outro(formatText(response.errorResponse?.message || "Failed to get task", "red"));
      process.exit(1);
    }

    const task = response.data;
    console.log(
      `${formatText(task.name, "cyan")} ${formatText(`(id: ${task.id})`, "gray")}`
    );
    console.log(`  Type: ${formatText(task.type, "yellow")}`);
    console.log(`  Status: ${formatText(task.status, "yellow")}`);
    console.log(`  Category ID: ${formatText(task.categoryId, "gray")}`);

    outro(formatText("✅ Task fetched", "green"));
    process.exit(0);
  }

  // If categoryId is provided, get tasks by category
  if (categoryId) {
    const response = await TaskService.getTasksByCategoryId<GetTasks>(categoryId);

    if (isApiError(response)) {
      outro(formatText(response.errorResponse?.message || "Failed to get tasks", "red"));
      process.exit(1);
    }

    if (response.data.tasks.length === 0) {
      outro(formatText("No tasks found in this category.", "yellow"));
      process.exit(0);
    }

    response.data.tasks.forEach((task, index) => {
      console.log(
        `${index + 1}. ${formatText(task.name, "cyan")} ${formatText(
          `(id: ${task.id})`
        )} - ${formatText(task.status, "yellow")} - ${formatText(task.type, "yellow")}`
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

    outro(formatText("✅ Tasks fetched", "green"));
    process.exit(0);
  }

  outro(formatText("Please provide either a categoryId or taskId", "yellow"));
  process.exit(1);
}

export const getTasks = new Command("get")
  .description("Get tasks by category ID or a single task by ID")
  .option("-c, --categoryId <categoryId>", "Category ID")
  .option("-t, --taskId <taskId>", "Task ID")
  .action((options) => getTasksAction(options.categoryId, options.taskId));
