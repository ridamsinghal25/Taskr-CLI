import { intro, outro } from "@clack/prompts";
import { Command } from "commander";
import NoteService from "../../services/note.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { formatText } from "../../lib/logger.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";
import { withSpinner } from "../../lib/spinner.js";
import { noteUpdateSchema } from "../../validation/note.js";
import { extractMessagesFromFlatten } from "../../lib/zodError.js";

export async function updateNoteAction(
  categoryName: string,
  noteTitle: string,
  title?: string,
  content?: string,
) {
  intro(formatText(`✏️ Update Note in ${categoryName}`, "white", ["bold"]));

  if (!categoryName) {
    outro(formatText("Category name is required", "yellow"));
    process.exit(1);
  }

  if (!noteTitle) {
    outro(formatText("Note title is required", "yellow"));
    process.exit(1);
  }

  const updates = { title, content };
  const validation = noteUpdateSchema.safeParse(updates);
  if (!validation.success) {
    let errorMessage = extractMessagesFromFlatten(validation.error);
    outro(formatText(`Invalid input: ${errorMessage}`, "yellow"));
    process.exit(1);
  }

  const token = await requireAuth();
  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  const response = await withSpinner("Updating note...", () =>
    NoteService.updateNoteByTitle<Partial<{ title: string; content: string }>>(
      noteTitle,
      categoryName,
      validation.data,
    ),
  );

  if (isApiResponse(response)) {
    outro(formatText(response.message || "Note updated successfully", "green"));
    process.exit(0);
  }

  outro(
    formatText(
      response.errorResponse?.message || "Failed to update note",
      "red",
    ),
  );
  process.exit(1);
}

export const updateNoteCommand = new Command("update")
  .description("Update a note")
  .argument("<categoryName>", "Category Name")
  .argument("<noteTitle>", "Note Title")
  .option("-t, --title <title>", "New note title")
  .option("-c, --content <content>", "New note content")
  .showHelpAfterError()
  .action((categoryName, noteTitle, options) =>
    updateNoteAction(categoryName, noteTitle, options.title, options.content),
  );
