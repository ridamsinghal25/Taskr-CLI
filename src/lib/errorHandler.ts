import { red } from "./logger.js";

export function handleCliError(err: unknown, context?: string) {
  const prefix = context ? `\n${context}:` : "\nError:";

  // ⚪ Generic JS errors
  if (err instanceof Error) {
    red(`Error ${prefix}: ${err.message}`)
    return;
  }

  // ⚫ Truly unknown
  red(`Error ${prefix}: Unknown error occurred.`)
}
