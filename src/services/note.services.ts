import { isApiResponse } from "../lib/typeGuard.js";
import ApiError from "../services/ApiError.js";
import ApiRequest from "../services/ApiRequest.js";
import ApiResponse from "./ApiResponse.js";

class NoteService {
  NOTE_BASE_URL = "/api/v1/notes";

  async createNoteByCategoryName<T>(
    title: string,
    content: string,
    categoryName: string,
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.NOTE_BASE_URL}/${encodeURIComponent(categoryName)}/create-note`,
    );

    const response = await apiRequest.postRequest<T>({ title, content });

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async getNotesByCategoryName<T>(
    categoryName: string,
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.NOTE_BASE_URL}/${encodeURIComponent(categoryName)}/get-notes`,
    );

    const response = await apiRequest.getRequest<T>({});

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async getNoteByTitle<T>(
    noteTitle: string,
    categoryName: string,
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.NOTE_BASE_URL}/${encodeURIComponent(categoryName)}/${encodeURIComponent(noteTitle)}/get-note`,
    );

    const response = await apiRequest.getRequest<T>({});

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async updateNoteByTitle<T>(
    noteTitle: string,
    categoryName: string,
    updates: Partial<{ title: string; content: string | undefined }>,
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.NOTE_BASE_URL}/${encodeURIComponent(categoryName)}/${encodeURIComponent(noteTitle)}/update-note`,
    );

    const response = await apiRequest.patchRequest<T>(updates);

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async deleteNotesByTitle<T>(
    categoryName: string,
    noteTitles: string[],
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.NOTE_BASE_URL}/${encodeURIComponent(categoryName)}/delete-notes`,
    );

    const response = await apiRequest.deleteRequest<T>({ notes: noteTitles });

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async moveNoteToCategoryByTitle<T>(
    noteTitle: string,
    categoryName: string,
    newCategoryName: string,
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.NOTE_BASE_URL}/${encodeURIComponent(categoryName)}/${encodeURIComponent(noteTitle)}/move-note`,
    );

    const response = await apiRequest.patchRequest<T>({ newCategoryName });

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }
}

export default new NoteService();
