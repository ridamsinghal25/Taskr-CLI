import { isApiError, isApiResponse } from "../lib/typeGuard.js";
import ApiError from "../services/ApiError.js";
import ApiRequest from "../services/ApiRequest.js";
import { TaskType, TaskStatus } from "../types/task.js";
import ApiResponse from "./ApiResponse.js";


class TaskService {
  TASK_BASE_URL = "/api/v1/tasks";

  async createTask<T>(
    name: string,
    type: TaskType,
    status: TaskStatus,
    categoryId: string
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(`${this.TASK_BASE_URL}?categoryId=${encodeURIComponent(categoryId)}`);

    const response = await apiRequest.postRequest<T>(
      { name, type, status },
    );

    if (isApiResponse(response)) {
      return response
    }

    return response;
  }

  async getTasksByCategoryId<T>(categoryId: string): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(`${this.TASK_BASE_URL}`);

    const response = await apiRequest.getRequest<T>(
      { categoryId },
    );

    if (isApiResponse(response)) {
      return response
    }

    return response;
  }

  async getTaskById<T>(taskId: string): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(`${this.TASK_BASE_URL}/${taskId}`);

    const response = await apiRequest.getRequest<T>({});

    if (isApiResponse(response)) {
      return response
    }

    return response;
  }

  async updateTask<T>(taskId: string, categoryId: string, updates: Partial<{
    name: string;
    type: TaskType;
    status: TaskStatus;
  }>): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.TASK_BASE_URL}/${taskId}?categoryId=${encodeURIComponent(categoryId)}`
    );

    const response = await apiRequest.patchRequest<T>(
      updates,
    );

    if (isApiResponse(response)) {
      return response
    }

    return response;
  }

  async moveTaskToCategory<T>(taskId: string, categoryId: string): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.TASK_BASE_URL}/${taskId}/move?categoryId=${encodeURIComponent(categoryId)}`
    );

    // backend uses POST and reads categoryId from query
    const response = await apiRequest.postRequest<T>(undefined);

    if (isApiResponse(response)) {
      return response
    }

    return response;
  }

  async deleteTasksFromCategory<T>(taskIds: string[], categoryId: string): Promise<ApiResponse<T> | ApiError>  {
    const apiRequest = new ApiRequest(
      `${this.TASK_BASE_URL}?categoryId=${encodeURIComponent(categoryId)}`
    );

    const response = await apiRequest.deleteRequest<T>(
      { taskIds },
    );

    if (isApiResponse(response)) {
      return response
    }

    return response;
  }
}

export default new TaskService();
