import { Body, HttpMethod, Fetch } from "./fetch";

export interface ApiOptions {
  fields?: string[];
  limit?: number;
  offset?: number;
}

export type FetchOptions = {};

type ApiQueryParams = {
  fields?: string;
  limit?: number;
  offset?: number;
};

export class Api {
  private fetch: Fetch;

  // Singleton
  private static instance: Api;

  private constructor(baseUrl: string) {
    this.fetch = new Fetch(baseUrl);
  }

  public static getInstance(): Api {
    if (!Api.instance) {
      throw new Error("Must initialize Api before use!");
    }
    return Api.instance;
  }

  public static init(baseURL: string): Api {
    Api.instance = new Api(baseURL);
    return this.getInstance();
  }

  private createQueryParams(options: ApiOptions): ApiQueryParams {
    return {
      fields: options.fields?.join(","),
      limit: options.limit,
      offset: options.offset,
    };
  }

  private async request<Response>(
    method: HttpMethod,
    path: string,
    body: Body | null,
    options?: ApiOptions,
  ): Promise<Response> {
    const queryParams = options && this.createQueryParams(options);

    try {
      return await this.fetch.request<Response>(method, path, body, {
        queryParams,
      });
    } catch (err) {
      // Useless to continue with tool once we reached the API limit
      if (err.status === 429) {
        console.error(`Too many requests, exit tool`, err);
      }
      throw err;
    }
  }

  async get<Response = void>(
    path: string,
    options?: ApiOptions,
  ): Promise<Response> {
    return await this.request<Response>(HttpMethod.GET, path, null, options);
  }

  async post<Response = void>(
    path: string,
    body: Body,
    options?: ApiOptions,
  ): Promise<Response> {
    return await this.request<Response>(HttpMethod.POST, path, body, options);
  }

  async put<Response = void>(
    path: string,
    body: Body,
    options?: ApiOptions,
  ): Promise<Response> {
    return await this.request<Response>(HttpMethod.PUT, path, body, options);
  }

  async delete<Response = void>(
    path: string,
    options?: ApiOptions,
  ): Promise<Response> {
    return await this.request<Response>(HttpMethod.DELETE, path, null, options);
  }
}
