import { isApiResponse } from "../lib/typeGuard.js";
import ApiError from "./ApiError.js";
import ApiRequest from "./ApiRequest.js";
import ApiResponse from "./ApiResponse.js";

class UserService {
  USER_BASE_URL = "/api/v1/users";

  async getCurrentUser<T>(): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(`${this.USER_BASE_URL}/me`);

    const response = await apiRequest.getRequest<T>({});

   if (isApiResponse(response)) {
      return response;
    }

    return response;
  }
}

export default new UserService();