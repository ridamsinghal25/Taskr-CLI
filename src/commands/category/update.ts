import { intro, outro } from "@clack/prompts";
import { Command } from "commander";
import CategoryService from "../../services/category.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { formatText } from "../../lib/logger.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { Category } from "../../types/category.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";
import { withSpinner } from "../../lib/spinner.js";

export async function updateCategoryAction(name: string, newName: string) {
  intro(formatText("✏️ Update Category", "white" , ["bold"]));

  const token = await requireAuth();

  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  const response = await withSpinner(
    "Updating category...",
    () => CategoryService.updateCategoryByName<Partial<Category>>(name, newName)
  );

  if (isApiResponse(response)) {
    outro(formatText(response.message || "Category updated successfully", "green"));
    process.exit(0);
  }

  outro(formatText(response.errorResponse?.message || "Failed to update category", "red"));
  process.exit(1);
}

export const updateCategory = new Command("update")
  .description("Update a category")
  .argument("<name>", "Category name to update")
  .argument("<newName>", "New category name")
  .showHelpAfterError()
  .action(updateCategoryAction);
