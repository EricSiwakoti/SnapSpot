export default class HttpError extends Error {
  code: number;

  constructor(message: string, errorCode: number) {
    super(message); // Add a "message" property
    this.code = errorCode; // Add a "code" property
  }
}
