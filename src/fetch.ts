import * as FormData from "form-data";
import { merge } from "lodash/fp";
import fetch, { BodyInit, HeadersInit, Response } from "node-fetch";
import { stringify } from "query-string";

import { RequestError } from "./requestError";

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

interface Options {
  queryParams?: Record<string, any>;
  headers?: Record<string, string>;
  bypassBaseUrl?: boolean;
}

export type Body = string | FormData | object;

export abstract class Request {
  private readonly baseUrl: string;
  private readonly headers?: HeadersInit;

  constructor(baseUrl: string, headers?: Record<string, string>) {
    this.baseUrl = baseUrl;
    this.headers = headers;
  }

  private buildQueryString(queryParams: Record<string, any>): string {
    return "?" + stringify(queryParams);
  }

  private buildURL(baseURL: string, path: string, options?: Options): string {
    const { queryParams, bypassBaseUrl } = options || {};

    const queryString = queryParams ? this.buildQueryString(queryParams) : "";

    return bypassBaseUrl ? path + queryString : baseURL + path + queryString;
  }

  private buildBody(body: Body): BodyInit {
    if (typeof body === "string") {
      return body;
    }

    if (body instanceof FormData) {
      return body;
    }

    // `body` must be an object
    return JSON.stringify(body);
  }

  private buildHeaders(
    body: Body | null,
    providedHeaders?: Record<string, string>,
  ): Record<string, string> {
    let mergedHeaders = merge(this.headers, providedHeaders) ?? {};

    if (body instanceof FormData) {
      mergedHeaders = merge(mergedHeaders, body.getHeaders());
    }

    return mergedHeaders;
  }

  private async parseResponse<ReturnValue>(
    response: Response,
  ): Promise<ReturnValue | NodeJS.ReadableStream> {
    const contentType = response.headers.get("content-type");

    if (contentType === "application/json") {
      return await response.json();
    }

    return response.body;
  }

  protected async _request<ReturnValue>(
    method: HttpMethod,
    path: string,
    providedBody: Body | null,
    options?: Options,
  ): Promise<ReturnValue> {
    const url = this.buildURL(this.baseUrl, path, options);
    const body = providedBody ? this.buildBody(providedBody) : undefined;
    const headers = this.buildHeaders(providedBody, options?.headers);

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    const returnValue = await this.parseResponse<ReturnValue>(response);

    if (!response.ok) {
      throw new RequestError(
        method,
        url,
        response.status,
        response.statusText,
        JSON.stringify(returnValue, null, 2),
      );
    }

    // @ts-expect-error Whenever we pass the `response.ok()` check, the response
    // is ok and the `returnValue` will contain the parsed response body
    // of type ReturnValue.
    return returnValue;
  }

  protected async _get<ReturnValue = void>(
    path: string,
    options?: Options,
  ): Promise<ReturnValue> {
    return await this._request<ReturnValue>(
      HttpMethod.GET,
      path,
      null,
      options,
    );
  }

  protected async _post<ReturnValue = void>(
    path: string,
    body: Body,
    options?: Options,
  ): Promise<ReturnValue> {
    return await this._request<ReturnValue>(
      HttpMethod.POST,
      path,
      body,
      options,
    );
  }

  protected async _put<ReturnValue = void>(
    path: string,
    body: Body,
    options?: Options,
  ): Promise<ReturnValue> {
    return await this._request<ReturnValue>(
      HttpMethod.PUT,
      path,
      body,
      options,
    );
  }

  protected async _patch<ReturnValue = void>(
    path: string,
    body: Body,
    options?: Options,
  ): Promise<ReturnValue> {
    return await this._request<ReturnValue>(
      HttpMethod.PATCH,
      path,
      body,
      options,
    );
  }

  protected async _delete<ReturnValue = void>(
    path: string,
    options?: Options,
  ): Promise<ReturnValue> {
    return await this._request<ReturnValue>(
      HttpMethod.DELETE,
      path,
      null,
      options,
    );
  }
}
