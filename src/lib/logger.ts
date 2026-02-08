import chalk from "chalk";

/**
 * Supported Chalk colors
 */
export type ChalkColor =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "blackBright"
  | "redBright"
  | "greenBright"
  | "yellowBright"
  | "blueBright"
  | "magentaBright"
  | "cyanBright"
  | "whiteBright"
  | "gray";

/**
 * Supported Chalk modifiers
 */
export type ChalkModifier =
  | "reset"
  | "bold"
  | "dim"
  | "italic"
  | "underline"
  | "overline"
  | "inverse"
  | "hidden"
  | "strikethrough"
  | "visible";


/**
 * Logs informational messages.
 */
const logInfo = (message: string) => {
  console.log(`${chalk.blue("[INFO]")} ${message}`);
};

/**
 * Logs successful messages.
 */
const logSuccess = (message: string) => {
  console.log(`${chalk.green("[SUCCESS]")} ${message}`);
};

/**
 * Logs warning messages.
 */
const logWarn = (message: string) => {
  console.log(`${chalk.yellow("[WARN]")} ${message}`);
};

/**
 * Logs debug / low-priority messages.
 */
const logDebug = (message: string) => {
  console.log(`${chalk.gray("[DEBUG]")} ${message}`);
};

/**
 * Logs errors (uses a distinct name so it doesn’t conflict
 * with your ApiError / AppError / exception classes).
 */
const logErrorMessage = (message: string) => {
  console.error(`${chalk.red("[ERROR]")} ${message}`);
};


/**
 * Core printer
 */
export function print(
  message: string,
  color: ChalkColor = "white",
  modifiers: ChalkModifier[] = []
) {
  let styled = chalk;

  // Apply modifiers first
  for (const modifier of modifiers) {
    styled = styled[modifier];
  }

  // Apply color
  styled = styled[color];

  console.log(styled(message));
}


/**
 * === Simple Colorized Helpers ===
 * Use these when you just want color output without a prefix or timestamp.
 * Ideal for highlights, UI elements, subtle CLI messaging, etc.
 */

const gray = (msg: string, mods: ChalkModifier[] = []) => {
  print(msg, "gray", mods);
};

const red = (msg: string, mods: ChalkModifier[] = []) => {
  print(msg, "red", mods);
};

const green = (msg: string, mods: ChalkModifier[] = []) => {
  print(msg, "green", mods);
};

const yellow = (msg: string, mods: ChalkModifier[] = []) => {
  print(msg, "yellow", mods);
};

const blue = (msg: string, mods: ChalkModifier[] = []) => {
  print(msg, "blue", mods);
};

const blueBright = (msg: string, mods: ChalkModifier[] = []) => {
  print(msg, "blueBright", mods);
};

const cyan = (msg: string, mods: ChalkModifier[] = []) => {
  print(msg, "cyan", mods);
};

const magenta = (msg: string, mods: ChalkModifier[] = []) => {
  print(msg, "magenta", mods);
};

export {
  // structured log levels
  logInfo,
  logSuccess,
  logWarn,
  logDebug,
  logErrorMessage,
  // simple color helpers
  gray,
  yellow,
  blue,
  blueBright,
  green,
  red,
  cyan,
  magenta,
};
