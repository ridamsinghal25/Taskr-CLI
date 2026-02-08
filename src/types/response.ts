export type Response<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};

export type ErrorResponse = {
  statusCode: number;
  errorCode: string;
  success: boolean;
  message: string;
  stack?: string;
}