export class ApiError extends Error {
  code: number;
  constructor(code: number, msg: string) {
    super(msg);
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
