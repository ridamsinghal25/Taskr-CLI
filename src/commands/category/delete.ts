import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import { Command } from "commander";
import CategoryService from "../../services/category.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { DeleteCategories} from "../../types/category.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { formatText } from "../../lib/logger.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";

export async function deleteCategoriesAction(ids: string) {
  intro(formatText("🗑️ Delete Categories", "white" , ["bold"]));

  const categoryIds = ids
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (categoryIds.length === 0) {
    outro(formatText("No valid category IDs provided.", "yellow"));
    process.exit(1);
  }

  const shouldDelete = await confirm({
    message: "Are you sure you want to delete these categories?",
    initialValue: false,
  });

  if (isCancel(shouldDelete) || !shouldDelete) {
    cancel("Delete cancelled");
    process.exit(0);
  }

  const token = await requireAuth();

  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  const response = await CategoryService.deleteCategories<DeleteCategories>(categoryIds);

  if (isApiResponse(response)) {
    outro(formatText(response.message || "Categories deleted successfully", "green"));
    process.exit(0);
  }

  outro(formatText(response.errorResponse?.message || "Failed to delete categories", "red"));
  process.exit(1);
}

export const deleteCategories = new Command("delete")
  .description("Delete categories")
  .argument("<ids>", "Comma-separated category IDs (e.g. id1,id2,id3, ...)")
  .action(deleteCategoriesAction);
