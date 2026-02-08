export type Response<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};
