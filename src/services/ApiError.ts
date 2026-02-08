import { ErrorResponse } from "../types/response.js";

class ApiError{
  public error: boolean;
  public errorMessage: string;
  public errorData: unknown;
  public errorResponse: ErrorResponse | undefined;

  constructor(
    errorMessage: string,
    errorData: unknown,
    errorResponse?: ErrorResponse | undefined,
  ) {
    this.error = true;
    this.errorMessage = errorMessage;
    this.errorData = errorData;
    this.errorResponse = errorResponse;
  }
}

export default ApiError;
