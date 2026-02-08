import { intro, outro } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import CategoryService from "../../services/category.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { red } from "../../lib/logger.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { Category } from "../../types/category.js";

export async function updateCategoryAction(id: string, name: string) {
  intro(chalk.bold("✏️ Update Category"));

  const categoryId = id
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (categoryId.length !== 1) {
    red("You can only update one category at a time");
    process.exit(1);
  }

  const token = await requireAuth();

  if (!token?.access_token) {
    console.log("You are not authenticated. Please login.");
    process.exit(1);
  }

  const response = await CategoryService.updateCategory<Partial<Category>>(categoryId[0]!, name);

  if (isApiResponse(response)) {
    outro(chalk.green(response.message || "Category updated successfully"));
    process.exit(0);
  }

  red(response.errorMessage || "Failed to update category");
  process.exit(1);
}

export const updateCategory = new Command("update")
  .description("Update a category")
  .argument("<id>", "Category ID")
  .argument("<name>", "New category name")
  .action(updateCategoryAction);
