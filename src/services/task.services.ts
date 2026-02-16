import { isApiResponse } from "../lib/typeGuard.js";
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


  async createTaskByCategoryName<T>(
    name: string,
    type: TaskType,
    status: TaskStatus,
    categoryName: string
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(`${this.TASK_BASE_URL}/${encodeURIComponent(categoryName)}/create-task`);

    const response = await apiRequest.postRequest<T>(
      { name, type, status },
    );

    if (isApiResponse(response)) {
      return response
    }

    return response;
  }


  async moveTaskToCategoryByName<T>(
    taskName: string,
    categoryName: string,
    newCategoryName: string
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.TASK_BASE_URL}/${encodeURIComponent(categoryName)}/${encodeURIComponent(taskName)}/move-task`
    );

    const response = await apiRequest.patchRequest<T>({ newCategoryName });

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async deleteTasksByName<T>(
    categoryName: string,
    tasks: string[]
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.TASK_BASE_URL}/${encodeURIComponent(categoryName)}/delete-tasks`
    );

    const response = await apiRequest.deleteRequest<T>({ tasks });

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async getTasksByCategoryName<T>(
    categoryName: string
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.TASK_BASE_URL}/${encodeURIComponent(categoryName)}/get-tasks`
    );

    const response = await apiRequest.getRequest<T>({});

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async getTaskByName<T>(
    taskName: string,
    categoryName: string 
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.TASK_BASE_URL}/${encodeURIComponent(categoryName)}/${encodeURIComponent(taskName)}/get-task`
    );

    const response = await apiRequest.getRequest<T>({});

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async updateTaskByName<T>(
    taskName: string,
    categoryName: string,
    task: Partial<{ name: string; type: string; status: string }>
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.TASK_BASE_URL}/${encodeURIComponent(categoryName)}/${encodeURIComponent(taskName)}/update-task`
    );

    const response = await apiRequest.patchRequest<T>({
      ...task,
    });

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

}

export default new TaskService();
