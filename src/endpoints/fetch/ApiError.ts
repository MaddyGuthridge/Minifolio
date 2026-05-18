/**
 * Custom error class for errors that happen when fetching data
 */
class ApiError extends Error {
  /** Error message */
  error: string;
  /** Status code */
  code: number | null;
  /** Body (if JSON, it is parsed) */
  body: object | string | null;

  /**
   * Custom error class for errors that happen when fetching data
   */
  constructor(code: number | null, error: string | object, body: string | object | null) {
    if (typeof error === 'object') {
      error = JSON.stringify(error);
    }
    super(`ApiError: [${code}] ${error}`);
    this.error = error;
    this.code = code;
    this.body = body;
  }
}

export default ApiError;
