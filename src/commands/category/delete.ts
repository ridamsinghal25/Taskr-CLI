import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import { Command } from "commander";
import CategoryService from "../../services/category.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { Category, DeleteCategories} from "../../types/category.js";
import { isApiError, isApiResponse } from "../../lib/typeGuard.js";
import { formatText } from "../../lib/logger.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";
import { withSpinner } from "../../lib/spinner.js";

export async function deleteCategoriesAction(names: string[]) {
  intro(formatText("🗑️ Delete Categories", "white" , ["bold"]));

  const categoryNames = names
    .map((name) => name.trim().replace(",", ""))
    .filter(Boolean);

  if (categoryNames.length === 0) {
    outro(formatText("No valid category names provided.", "yellow"));
    process.exit(1);
  }

  const token = await requireAuth();

  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  const categories = await withSpinner(
    `Fetching ${categoryNames.length > 1 ? "these": "this"} ${categoryNames.length > 1 ? "categories" : "category"}...`,
    () => CategoryService.getCategoriesByName<Pick<Category, "name">[]>(categoryNames)
  );

  if (isApiError(categories)) {
    outro(formatText(categories.errorResponse?.message || "Failed to get categories", "red"));
    process.exit(1);
  }

  if (categories.data?.length === 0) {
    outro(formatText("No categories found.", "yellow"));
    process.exit(0);
  }

  const shouldDelete = await confirm({
    message: `Are you sure you want to delete these categories: ${categories.data?.map((category) => category.name).join(", ")}?`,
    initialValue: true,
  });

  if (isCancel(shouldDelete) || !shouldDelete) {
    cancel("Delete operation cancelled");
    process.exit(0);
  }

  const response = await withSpinner(
    "Deleting categories...",
    () => CategoryService.deleteCategoriesByName<DeleteCategories>(categoryNames)
  )

  if (isApiResponse(response)) {
    outro(formatText(response.message || "Categories deleted successfully", "green"));
    process.exit(0);
  }

  outro(formatText(response.errorResponse?.message || "Failed to delete categories", "red"));
  process.exit(1);
}

export const deleteCategories = new Command("delete")
  .description("Delete categories")
  .argument("<names...>", "Comma-separated category names (e.g. name1,name2,name3, ...)")
  .showHelpAfterError()
  .action(deleteCategoriesAction);
