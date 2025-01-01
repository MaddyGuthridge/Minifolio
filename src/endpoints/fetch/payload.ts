type TextPayload = {
  /** `Content-Type` header to use */
  contentType: string,
  /** Payload converted to a string */
  payload: string,
};

/** Information about a request payload */
export type PayloadInfo = TextPayload | {
  contentType: undefined,
  payload: FormData,
};

/** Generate a function to handle payloads of the given type */
function generateTextPayloadFn<T>(
  contentType: string,
  converter: (body: T) => string,
): (body: T) => TextPayload {
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
  json: generateTextPayloadFn('application/json', JSON.stringify),
  /** Request payload in Markdown format */
  markdown: generateTextPayloadFn('text/markdown', noop),
  /** Request payload in plain text format */
  text: generateTextPayloadFn('text/plain', noop),
  /** Send a file */
  file: (file: File) => {
    const form = new FormData();
    form.append('content', file);
    return { contentType: undefined, payload: form };
  },
  /** Request using a custom mime-type */
  custom: (contentType: string, body: string) => ({ contentType, payload: body })
};
