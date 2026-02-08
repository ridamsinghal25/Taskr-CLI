import {AxiosRequestHeaders} from "axios";
import { asyncHandler } from "../lib/asyncHandler.js";
import axiosInstance from "../lib/axios.js";
import { Response } from "../types/response.js";


interface RequestConfig {
  timeout?: number;
}

class ApiRequest {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }


  async getRequest<T>(
    queryParams: Record<string, unknown> = {},
    headers?: AxiosRequestHeaders,
    config?: RequestConfig
  ) {
    return asyncHandler<T>(() =>
      axiosInstance.get<Response<T>>(this.url, {
        params: queryParams,
        headers: headers ?? {},
        timeout: config?.timeout ?? 10000,
      })
    );  
  }

  async postRequest<T = unknown>(
    body: unknown,
    headers?: AxiosRequestHeaders,
    config?: RequestConfig
  ) {
    return asyncHandler<T>(() =>
      axiosInstance.post<Response<T>>(
        this.url, 
        body, 
        {
            headers: headers ?? {},
            timeout: config?.timeout || 10000,
        }
      )
    );
  }

  async putRequest<T = unknown>(
    body: unknown,
    headers?: AxiosRequestHeaders,
    config?: RequestConfig
  ) {
    return asyncHandler<T>(() =>
      axiosInstance.put<Response<T>>(
        this.url, 
        body, 
        { 
            headers: headers ?? {},
            timeout: config?.timeout ?? 10000,
        }
      )
    );
  }

  async deleteRequest<T = unknown>(
    body: unknown,
    headers?: AxiosRequestHeaders,
    config?: RequestConfig
  ) {
    return asyncHandler<T>(() =>
    axiosInstance.delete<Response<T>>(
        this.url, 
        {
            data: body,
            headers: headers ?? {},
            timeout: config?.timeout ?? 10000,
        }
      )
    );
  }

  async patchRequest<T = unknown>(
    body: unknown,
    headers?: AxiosRequestHeaders,
    config?: RequestConfig 
  ) {
    return asyncHandler<T>(() =>
      axiosInstance.patch<Response<T>>(this.url, body, {
        headers: headers ?? {},
        timeout: config?.timeout ?? 10000,
      })
    );
  }
}

export default ApiRequest;
