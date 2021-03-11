export abstract class BaseError extends Error {
  readonly timestamp: string;
  readonly code: string;
  readonly wrappedError?: Error;

  constructor(message: string, code: string, wrappedError?: Error) {
    super(message);
    this.timestamp = new Date().toISOString();
    this.code = code;
    this.wrappedError = wrappedError;

    // Maintain proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);

    /**
     * Make the name property of the error non-enumerable, which means that
     * it won't show up when used with JSON.stringify or when iterated
     * through the object using Object.keys() or a for...in loop.
     * You can still access the property directly on the object though.
     */
    Object.defineProperty(this, "name", {
      value: this.constructor.name,
      enumerable: false,
    });
  }
}
