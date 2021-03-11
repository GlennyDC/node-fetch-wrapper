import { BaseError } from "./baseError";
import { HttpMethod } from "./fetch";

export class RequestError extends BaseError {
  readonly method: HttpMethod;
  readonly resource: string;
  readonly requestTimestamp: string;
  readonly status: number;
  readonly responseBody: string | null;

  constructor(
    method: HttpMethod,
    resource: string,
    requestTimestamp: string,
    status: number,
    message: string,
    responseBody: string,
    wrappedError?: Error,
  ) {
    super(message, "REQUEST_ERROR", wrappedError);
    this.method = method;
    this.resource = decodeURIComponent(resource);
    this.requestTimestamp = requestTimestamp;
    this.status = status;
    this.responseBody = responseBody;
  }
}
