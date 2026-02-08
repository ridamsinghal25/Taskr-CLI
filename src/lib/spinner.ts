import yoctoSpinner from "yocto-spinner";

/**
 * Wraps an async operation with a spinner that shows a custom message
 * @param message - The message to display in the spinner
 * @param operation - The async operation to execute
 * @returns The result of the operation
 */
export async function withSpinner<T>(
  message: string,
  operation: () => Promise<T>
): Promise<T> {
  const spinner = yoctoSpinner({ text: message });
  spinner.start();

  try {
    const result = await operation();
    spinner.stop();
    
    return result;
  } catch (error) {
    spinner.stop();

    throw error;
  } finally {
    spinner.stop();
  }
}
