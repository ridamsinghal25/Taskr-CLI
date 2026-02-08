import { Command } from "commander";
import { createCategory } from "./create.js";
import { getCategory } from "./get.js";
import { updateCategory } from "./update.js";
import { deleteCategories } from "./delete.js";

export const category = new Command("category").description(
  "Manage categories"
);

category.addCommand(createCategory);
category.addCommand(getCategory);
category.addCommand(updateCategory);
category.addCommand(deleteCategories);
