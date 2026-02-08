class ApiError {
  public error: boolean;
  public errorMessage: string;
  public errorData: unknown;
  public errorResponse: unknown;

  constructor(
    errorMessage: string,
    errorData: unknown,
    errorResponse?: unknown,
  ) {
    this.error = true;
    this.errorMessage = errorMessage;
    this.errorData = errorData;
    this.errorResponse = errorResponse;
  }
}

export default ApiError;
