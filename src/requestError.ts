import { BaseError } from "./baseError";
import { HttpMethod } from "./fetch";

export class RequestError extends BaseError {
  readonly method: HttpMethod;
  readonly resource: string;
  readonly status: number;
  readonly responseBody: string;

  constructor(
    method: HttpMethod,
    resource: string,
    status: number,
    message: string,
    responseBody: string,
  ) {
    super(message, "REQUEST_ERROR");
    this.method = method;
    this.resource = decodeURIComponent(resource);
    this.status = status;
    this.responseBody = responseBody;
  }
}
