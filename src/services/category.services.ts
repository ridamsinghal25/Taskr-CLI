import ApiError from "./ApiError.js";
import ApiRequest from "./ApiRequest.js";
import { isApiResponse } from "../lib/typeGuard.js";
import ApiResponse from "./ApiResponse.js";

class CategoryService {
  CATEGORY_BASE_URL = "/api/v1/categories";

  async createCategory<T>(name: string): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(this.CATEGORY_BASE_URL);

    const response = await apiRequest.postRequest<T>(
      { name }
    );

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async updateCategory<T>(categoryId: string, name: string): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(`${this.CATEGORY_BASE_URL}/${categoryId}`);

    const response = await apiRequest.patchRequest<T>(
      { name },
    );

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async getCategories<T>(): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(this.CATEGORY_BASE_URL);

    const response = await apiRequest.getRequest<T>({});

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async deleteCategories<T>(categoryIds: string[]): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(this.CATEGORY_BASE_URL);

    const response = await apiRequest.deleteRequest<T>(
      { categoryIds },
    );

    if (isApiResponse(response)) {
      return response
    }

    return response;
  }

  async getCategoriesByIds<T>(categoryIds: string[]): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(`${this.CATEGORY_BASE_URL}/bulk-get`);

    const response = await apiRequest.postRequest<T>(
      { categoryIds },
    );

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async getCategoriesByName<T>(categoryNames: string[]): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(`${this.CATEGORY_BASE_URL}/bulk-get-by-name`);

    const response = await apiRequest.postRequest<T>(
      { categoryNames },
    );

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async updateCategoryByName<T>(
    categoryName: string,
    newName: string
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.CATEGORY_BASE_URL}/${encodeURIComponent(categoryName)}/update-category`
    );

    const response = await apiRequest.patchRequest<T>({ name: newName });

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async deleteCategoriesByName<T>(
    categories: string[]
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.CATEGORY_BASE_URL}/delete-categories-by-name`
    );

    const response = await apiRequest.deleteRequest<T>({ categories });

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }
}

export default new CategoryService();
