#!/usr/bin/env node

import dotenv from "dotenv";
import figlet from "figlet";

import { Command } from "commander";

import { auth } from "./commands/auth/index.js";
import { category } from "./commands/category/index.js";
import { task } from "./commands/task/index.js";
import { note } from "./commands/note/index.js";
import { logErrorMessage, gray, cyan } from "./lib/logger.js";

dotenv.config({ quiet: true });

async function main() {
  // Display banner
  cyan(
    figlet.textSync("Taskr CLI", {
      font: "Standard",
      horizontalLayout: "default",
    }),
  );

  gray("A Cli based Task Management Tool \n");

  const program = new Command("taskr");

  program
    .version("0.0.1")
    .description("Taskr CLI - A Cli based Task Management Tool");

  // Add commands
  program.addCommand(auth);
  program.addCommand(category);
  program.addCommand(task);
  program.addCommand(note);

  // Default action shows help
  program.action(() => {
    program.help();
  });

  program.addHelpText(
    "afterAll",
    `
  Note:
    If any argument contains spaces, wrap it in quotes ("" or '').
    
  Example:
    $ taskr category create "Work Tasks"
  `,
  );

  program.parse();
}

main().catch((err) => {
  logErrorMessage(`Error running Taskr CLI: ${err}`);
  process.exit(1);
});
