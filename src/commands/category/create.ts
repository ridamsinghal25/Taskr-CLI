import { intro, outro } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import CategoryService from "../../services/category.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { red, formatText } from "../../lib/logger.js";
import { Category } from "../../types/category.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";

export async function createCategoryAction(name: string) {
  intro(formatText("📁 Create Category", "white" , ["bold"]));

  const token = await requireAuth();

  if (!token?.access_token) {
    red(ErrorMessageEnum.NOT_AUTHENTICATED);
    process.exit(1);
  }

  const response = await CategoryService.createCategory<Category>(name);

  if (isApiResponse(response)) {
    outro(formatText(response.message || "Category created successfully", "green"));
    process.exit(0);
  }

  outro(formatText(response.errorResponse?.message || "Failed to create category", "red"));
  process.exit(1);
}

export const createCategory = new Command("create")
  .description("Create a new category")
  .argument("<name>", "Category name")
  .action(createCategoryAction);
