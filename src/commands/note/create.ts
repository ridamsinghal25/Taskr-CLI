import { intro, outro } from "@clack/prompts";
import { Command } from "commander";
import NoteService from "../../services/note.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { formatText } from "../../lib/logger.js";
import { isApiResponse } from "../../lib/typeGuard.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";
import { withSpinner } from "../../lib/spinner.js";
import { noteSchema } from "../../validation/note.js";
import { Note } from "../../types/note.js";
import { extractMessagesFromFlatten } from "../../lib/zodError.js";

export async function createNoteAction(
  categoryName: string,
  title: string,
  content: string,
) {
  intro(formatText(`📝 Create Note in ${categoryName}`, "white", ["bold"]));

  const validation = noteSchema.safeParse({ title, content, categoryName });

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

  const response = await withSpinner("Creating note...", () =>
    NoteService.createNoteByCategoryName<Note>(title, content, categoryName),
  );

  if (isApiResponse(response)) {
    outro(formatText(response.message || "Note created successfully", "green"));
    process.exit(0);
  }

  outro(
    formatText(
      response.errorResponse?.message || "Failed to create note",
      "red",
    ),
  );
  process.exit(1);
}

export const createNote = new Command("create")
  .description("Create a new note")
  .argument("<categoryName>", "Category name")
  .argument("<title>", "Note title")
  .argument("<content>", "Note content")
  .showHelpAfterError()
  .action(createNoteAction);
