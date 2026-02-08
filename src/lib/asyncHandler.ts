import ApiError from "../services/ApiError.js";
import ApiResponse from "../services/ApiResponse.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { AxiosResponse } from "axios";
import { Response } from "../types/response.js";

/**
 * Generic async handler wrapper
 */
export const asyncHandler = <T>(
  func: () => Promise<AxiosResponse<Response<T>>>
): Promise<ApiResponse<T> | ApiError> => {
  return Promise.resolve(func())
    .then((data: AxiosResponse<Response<T>>) => {
      const responseData = data?.data;

      return new ApiResponse<T>(
        responseData.statusCode,
        responseData.data,
        responseData.message,
        responseData.success
      );
    })
    .catch((error: unknown) => {
    const axiosError = error as any;

      if (
        (axiosError?.status === HTTPSTATUS.UNPROCESSABLE_ENTITY || axiosError?.response?.status === HTTPSTATUS.UNPROCESSABLE_ENTITY) &&
        Array.isArray(axiosError?.response?.data?.errors) &&
        axiosError.response.data.errors.length > 0
      ) {

        return new ApiError(
          axiosError.message,
          axiosError,
          axiosError.response.data,
        );
      }

      return new ApiError(
        axiosError.message,
        axiosError,
        axiosError?.response?.data
      );
    });
};
