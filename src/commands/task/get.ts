import { intro, outro, multiselect } from "@clack/prompts";
import clipboardy from "clipboardy";
import { Command } from "commander";
import TaskService from "../../services/task.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { isApiError } from "../../lib/typeGuard.js";
import { blueBright, formatText, red } from "../../lib/logger.js";
import { Task } from "../../types/task.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";
import { withSpinner } from "../../lib/spinner.js";

export async function getTasksAction(categoryName: string, taskName?: string) {
  intro(formatText(`📋 Your Tasks in ${categoryName}`, "white" , ["bold"]));

  if (!categoryName) {
    outro(formatText("Category name is required", "yellow"));
    process.exit(1);
  }

  const token = await requireAuth();

  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  // If categoryName is provided, get tasks by categoryName
  if (categoryName && !taskName) {
    const response = await withSpinner(
      "Fetching tasks...",
      () => TaskService.getTasksByCategoryName<Task[]>(categoryName)
    );

    if (isApiError(response)) {
      outro(formatText(response.errorResponse?.message || "Failed to get tasks", "red"));
      process.exit(1);
    }

    if (response.data.length === 0) {
      outro(formatText("No tasks found in this category.", "yellow"));
      process.exit(0);
    }

    response.data.forEach((task, index) => {
      console.log(
        `${index + 1}. ${formatText(task.name, "cyan")} - Status: ${formatText(task.status, "yellow")} - Type: ${formatText(task.type, "yellow")}`
      );
    });

    const selectedTasks = await multiselect({
      message: "Select tasks to copy their names",
      options: response.data.map((task) => ({
        label: task.name,
        value: task.name,
      })),
      required: false,
    });

    if (Array.isArray(selectedTasks) && selectedTasks.length > 0) {
      clipboardy.writeSync(selectedTasks.join(", "));

      blueBright(
        `✅ ${
          selectedTasks.length > 1 ? "Task names" : "Task name"
        } copied to clipboard`
      );
    } else {
      red("❌ No tasks selected");
    }

    outro(formatText("✅ Tasks fetched successfully", "green"));
    process.exit(0);
  }

  // If taskName is provided, get single task
  if (taskName && categoryName) {
    const response = await withSpinner(
      "Fetching task...",
      () => TaskService.getTaskByName<Task>(taskName, categoryName)
    );

    if (isApiError(response)) {
      outro(formatText(response.errorResponse?.message || "Failed to get task", "red"));
      process.exit(1);
    }

    const task = response.data;
    console.log(
      `${formatText(task.name, "cyan")}`
    );
    console.log(`  Type: ${formatText(task.type, "yellow")}`);
    console.log(`  Status: ${formatText(task.status, "yellow")}`);

    outro(formatText("✅ Task fetched successfully", "green"));
    process.exit(0);
  }

  outro(formatText("Please provide either a category name or both category name and task name", "yellow"));
  process.exit(1);
}

export const getTasks = new Command("get")
  .description("Get tasks by category name or a single task by both category name and task name")
  .argument("<categoryName>", "Category Name")
  .option("-t, --taskName <taskName>", "Task Name")
  .showHelpAfterError()
  .action((categoryName, options) => getTasksAction(categoryName, options.taskName));
