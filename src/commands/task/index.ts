import { Command } from "commander";
import { createTask } from "./create.js";
import { getTasks } from "./get.js";
import { updateTaskCommand } from "./update.js";
import { deleteTasksCommand } from "./delete.js";
import { moveTask } from "./move.js";

export const task = new Command("task").description("Manage tasks");

task.addCommand(createTask);
task.addCommand(getTasks);
task.addCommand(updateTaskCommand);
task.addCommand(deleteTasksCommand);
task.addCommand(moveTask);