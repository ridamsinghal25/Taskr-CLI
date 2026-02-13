import { intro, outro, multiselect } from "@clack/prompts";
import clipboardy from "clipboardy";
import { Command } from "commander";
import CategoryService from "../../services/category.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { isApiError } from "../../lib/typeGuard.js";
import { blueBright, formatText, red } from "../../lib/logger.js";
import { Category } from "../../types/category.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";
import { withSpinner } from "../../lib/spinner.js";

export async function getCategoryAction() {
  intro(formatText("📂 Your Categories", "white" , ["bold"]));

  const token = await requireAuth();

  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  const response = await withSpinner(
    "Fetching categories...",
    () => CategoryService.getCategories<Category[]>()
  );

  if (isApiError(response)) {
    outro(formatText(response.errorResponse?.message || "Failed to create category", "red"));
    process.exit(1);
  }

  if (response.data?.length === 0) {
    outro(formatText("No categories found.", "yellow"));
    process.exit(0);
  }

  response.data.forEach((category, index) => {
    console.log(
      `${index + 1}. ${formatText(category.name, "cyan")}`
    );
  });

  const selectedCategories = await multiselect({
    message: "Select categories to copy there names",
    options: response.data.map((category) => ({
      label: category.name,
      value: category.name,
    })),
    required: false,
  });

  if (Array.isArray(selectedCategories) && selectedCategories.length > 0) {
    clipboardy.writeSync(selectedCategories.join(", "));

    blueBright(
      `✅ ${
        selectedCategories.length > 0 ? "Categories names" : "Category name"
      } copied to clipboard`
    )
  } else {
    red("❌ No categories selected")
  }

  outro(formatText("✅ Categories fetched successfully", "green"));
  process.exit(0);
}

export const getCategory = new Command("get")
  .description("Get all categories")
  .showHelpAfterError()
  .action(getCategoryAction);
