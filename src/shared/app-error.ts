import { HTTP_CODES } from './status-codes';

export class NotFoundError extends Error {
  statusCode: number;

  constructor(message: string = 'Not Found') {
    super(message);
    this.statusCode = 404;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class BadRequestError extends Error {
  statusCode: number;

  constructor(message: string = 'Bad Request') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = HTTP_CODES.CLIENT.BAD_REQUEST;
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnprocessableEntityError extends Error {
  statusCode: number;

  constructor(message: string = 'Un processable Entity Error') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = HTTP_CODES.CLIENT.UNPROCESSABLE_ENTITY;
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
export class UnAuthorizedError extends Error {
  statusCode: number;

  constructor(message: string = 'Un Authorized Error') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = HTTP_CODES.CLIENT.UNAUTHORIZED;
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class AppError extends Error {
  statusCode: number;

  constructor(err: any) {
    super(err.message || 'internal server error');
    this.name = err.name || 'InternalServerError';
    this.statusCode = err.statusCode || 500;
  }
}
