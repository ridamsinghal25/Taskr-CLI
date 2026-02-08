import { intro, outro } from "@clack/prompts";
import { Command } from "commander";
import CategoryService from "../../services/category.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { formatText } from "../../lib/logger.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { Category } from "../../types/category.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";

export async function updateCategoryAction(id: string, name: string) {
  intro(formatText("✏️ Update Category", "white" , ["bold"]));

  const categoryId = id
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (categoryId.length !== 1) {
    outro(formatText("You can only update one category at a time", "yellow"));
    process.exit(1);
  }

  const token = await requireAuth();

  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  const response = await CategoryService.updateCategory<Partial<Category>>(categoryId[0]!, name);

  if (isApiResponse(response)) {
    outro(formatText(response.message || "Category updated successfully", "green"));
    process.exit(0);
  }

  outro(formatText(response.errorResponse?.message || "Failed to update category", "red"));
  process.exit(1);
}

export const updateCategory = new Command("update")
  .description("Update a category")
  .argument("<id>", "Category ID")
  .argument("<name>", "New category name")
  .action(updateCategoryAction);
