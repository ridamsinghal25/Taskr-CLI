import { intro, outro, multiselect } from "@clack/prompts";
import clipboardy from "clipboardy";
import { Command } from "commander";
import NoteService from "../../services/note.services.js";
import { requireAuth } from "../../lib/auth-token.js";
import { isApiError } from "../../lib/typeGuard.js";
import { blueBright, formatText, red } from "../../lib/logger.js";
import { Note } from "../../types/note.js";
import { ErrorMessageEnum } from "../../enums/errorMessage.enum.js";
import { withSpinner } from "../../lib/spinner.js";

export async function getNotesAction(categoryName: string, noteTitle?: string) {
  intro(formatText(`📋 Your Notes in ${categoryName}`, "white", ["bold"]));

  if (!categoryName) {
    outro(formatText("Category name is required", "yellow"));
    process.exit(1);
  }

  const token = await requireAuth();
  if (!token?.access_token) {
    outro(formatText(ErrorMessageEnum.NOT_AUTHENTICATED, "red"));
    process.exit(1);
  }

  if (!noteTitle) {
    const response = await withSpinner("Fetching notes...", () =>
      NoteService.getNotesByCategoryName<Note[]>(categoryName),
    );

    if (isApiError(response)) {
      outro(
        formatText(
          response.errorResponse?.message || "Failed to get notes",
          "red",
        ),
      );
      process.exit(1);
    }

    if (response.data.length === 0) {
      outro(formatText("No notes found in this category.", "yellow"));
      process.exit(0);
    }

    response.data.forEach((note, index) => {
      console.log(`${index + 1}. ${formatText(note.title, "cyan")}`);
      console.log(`   ${note.content}`);
      console.log(`   createdAt: ${note.createdAt}`);
      console.log(`   updatedAt: ${note.updatedAt}`);
      console.log("-");
    });

    const selectedNotes = await multiselect({
      message: "Select notes to copy their titles",
      options: response.data.map((note) => ({
        label: note.title,
        value: note.title,
      })),
      required: false,
    });

    if (Array.isArray(selectedNotes) && selectedNotes.length > 0) {
      clipboardy.writeSync(selectedNotes.join(", "));
      blueBright(
        `✅ ${selectedNotes.length > 1 ? "Note titles" : "Note title"} copied to clipboard`,
      );
    } else {
      red("❌ No notes selected");
    }

    outro(formatText("✅ Notes fetched successfully", "green"));
    process.exit(0);
  }

  const response = await withSpinner("Fetching note...", () =>
    NoteService.getNoteByTitle<Note>(noteTitle, categoryName),
  );

  if (isApiError(response)) {
    outro(
      formatText(
        response.errorResponse?.message || "Failed to get note",
        "red",
      ),
    );
    process.exit(1);
  }

  const note = response.data;
  console.log(`${formatText(note.title, "cyan")}`);
  console.log(note.content);
  console.log(`  createdAt: ${note.createdAt}`);
  console.log(`  updatedAt: ${note.updatedAt}`);

  outro(formatText("✅ Note fetched successfully", "green"));
  process.exit(0);
}

export const getNotes = new Command("get")
  .description("Get notes by category name or a single note by category+title")
  .argument("<categoryName>", "Category Name")
  .option("-n, --noteTitle <noteTitle>", "Note Title")
  .showHelpAfterError()
  .action((categoryName, options) =>
    getNotesAction(categoryName, options.noteTitle),
  );
