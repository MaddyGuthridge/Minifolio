/** Information about a request payload */
export type PayloadInfo = {
  /** `Content-Type` header to use */
  contentType: string,
  /** Payload converted to a string */
  payload: string,
}

/** Generate a function to handle payloads of the given type */
function generatePayloadFn<T>(
  contentType: string,
  converter: (body: T) => string,
): (body: T) => PayloadInfo {
  return (body) => ({
    contentType,
    payload: converter(body),
  });
}

/** No transformation on the payload */
const noop = (body: string) => body;

/** Send a request payload of the given type */
export default {
  /** Request payload in JSON format */
  json: generatePayloadFn('application/json', JSON.stringify),
  /** Request payload in Markdown format */
  markdown: generatePayloadFn('text/markdown', noop),
  /** Request payload in plain text format */
  text: generatePayloadFn('text/plain', noop),
  /** Request using a custom mime-type */
  custom: (contentType: string, body: string) => ({ contentType, payload: body })
};
