import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import { Command } from "commander";
import NoteService from "../../services/note.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { DeleteNotes } from "../../types/note.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { formatText } from "../../lib/logger.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";
import { withSpinner } from "../../lib/spinner.js";

export async function deleteNotesAction(
  categoryName: string,
  noteTitles: string[],
) {
  intro(formatText(`🗑️ Delete Notes in ${categoryName}`, "white", ["bold"]));

  if (!categoryName) {
    outro(formatText("Category name is required", "yellow"));
    process.exit(1);
  }

  const names = noteTitles
    .map((name) => name.trim().replace(",", ""))
    .filter(Boolean);

  if (names.length === 0) {
    outro(formatText("No valid note titles provided.", "yellow"));
    process.exit(1);
  }

  const shouldDelete = await confirm({
    message: `Are you sure you want to delete these notes: ${names.join(", ")}?`,
    initialValue: true,
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

  const response = await withSpinner("Deleting notes...", () =>
    NoteService.deleteNotesByTitle<DeleteNotes>(categoryName, names),
  );

  if (isApiResponse(response)) {
    outro(
      formatText(response.message || "Notes deleted successfully", "green"),
    );
    process.exit(0);
  }

  outro(
    formatText(
      response.errorResponse?.message || "Failed to delete notes",
      "red",
    ),
  );
  process.exit(1);
}

export const deleteNotesCommand = new Command("delete")
  .description("Delete notes from a category")
  .argument("<categoryName>", "Category Name")
  .argument(
    "<noteTitles...>",
    "Comma-separated note titles (e.g. title1,title2,title3, ...)",
  )
  .showHelpAfterError()
  .action(deleteNotesAction);
