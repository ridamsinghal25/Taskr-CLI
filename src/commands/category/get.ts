import { intro, outro, multiselect } from "@clack/prompts";
import chalk from "chalk";
import clipboardy from "clipboardy";
import { Command } from "commander";
import CategoryService from "../../services/category.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { isApiError } from "../../lib/typeGuard.js";
import { blueBright, red } from "../../lib/logger.js";
import { GetCategories } from "../../types/category.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";

export async function getCategoryAction() {
  intro(chalk.bold("📂 Your Categories"));

  const token = await requireAuth();

  if (!token?.access_token) {
    console.log(ErrorMessageEnum.NOT_AUTHENTICATED);
    process.exit(1);
  }

  const response = await CategoryService.getCategories<GetCategories>();

  if (isApiError(response)) {
    red(response.errorMessage || "Failed to create category");
    process.exit(1);
  }

  if (response.data.categories.length === 0) {
    outro(chalk.yellow("No categories found."));
    process.exit(0);
  }

  response.data.categories.forEach((category, index) => {
    console.log(
      `${index + 1}. ${chalk.cyan(category.name)} ${chalk.gray(
        `(id: ${category.id})`
      )}`
    );
  });

  const selectedCategories = await multiselect({
    message: "Select categories to copy there ids",
    options: response.data.categories.map((category) => ({
      label: category.name,
      value: category.id,
    })),
    required: false,
  });

  if (Array.isArray(selectedCategories) && selectedCategories.length > 0) {
    clipboardy.writeSync(selectedCategories.join(", "));

    blueBright(
      `✅ ${
        selectedCategories.length > 0 ? "Categories IDs" : "Category ID"
      } copied to clipboard`
    )
  } else {
    red("❌ No categories selected")
  }

  outro(chalk.green("✅ Categories fetched"));
  process.exit(0);
}

export const getCategory = new Command("get")
  .description("Get all categories")
  .action(getCategoryAction);
