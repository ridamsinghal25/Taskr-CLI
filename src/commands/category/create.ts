import { intro, outro } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import CategoryService from "../../services/category.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { green, print, red } from "../../lib/logger.js";
import { Category } from "../../types/category.js";
import { isApiResponse } from "../../lib/typeGuard.js";

export async function createCategoryAction(name: string) {
  intro(chalk.bold("📁 Create Category"));

  const token = await requireAuth();

  if (!token?.access_token) {
    red("You are not authenticated. Please run login command first.");
    process.exit(1);
  }

  const response = await CategoryService.createCategory<Category>(name);

  if (isApiResponse(response)) {
    outro(chalk.green(response.message || "Category created successfully"));
    process.exit(0);
  }

  red(response.errorMessage || "Failed to create category");
  process.exit(1);
}

export const createCategory = new Command("create")
  .description("Create a new category")
  .argument("<name>", "Category name")
  .action(createCategoryAction);
