import { Command } from "commander";
import { createNote } from "./create.js";
import { getNotes } from "./get.js";
import { updateNoteCommand } from "./update.js";
import { deleteNotesCommand } from "./delete.js";
import { moveNote } from "./move.js";

export const note = new Command("note")
  .alias("n")
  .description("Manage notes");

note.addCommand(createNote);
note.addCommand(getNotes);
note.addCommand(updateNoteCommand);
note.addCommand(deleteNotesCommand);
note.addCommand(moveNote);
