import { intro, outro } from "@clack/prompts";
import { Command } from "commander";
import NoteService from "../../services/note.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { formatText } from "../../lib/logger.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";
import { withSpinner } from "../../lib/spinner.js";

export async function moveNoteAction(
  noteTitle: string,
  categoryName: string,
  newCategoryName: string,
) {
  intro(
    formatText(
      `🔄 Moving note ${noteTitle} from ${categoryName} to ${newCategoryName}`,
      "white",
      ["bold"],
    ),
  );

  if (!noteTitle) {
    outro(formatText("Note title is required", "yellow"));
    process.exit(1);
  }

  if (!categoryName) {
    outro(formatText("Category name is required", "yellow"));
    process.exit(1);
  }

  if (!newCategoryName) {
    outro(formatText("New category name is required", "yellow"));
    process.exit(1);
  }

  const token = await requireAuth();
  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  const response = await withSpinner("Moving note...", () =>
    NoteService.moveNoteToCategoryByTitle<{}>(
      noteTitle,
      categoryName,
      newCategoryName,
    ),
  );

  if (isApiResponse(response)) {
    outro(formatText(response.message || "Note moved successfully", "green"));
    process.exit(0);
  }

  outro(
    formatText(response.errorResponse?.message || "Failed to move note", "red"),
  );
  process.exit(1);
}

export const moveNote = new Command("move")
  .description("Move a note to another category")
  .argument("<noteTitle>", "Note Title")
  .argument("<categoryName>", "Category Name")
  .argument("<newCategoryName>", "New Category Name")
  .showHelpAfterError()
  .action(moveNoteAction);
