export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public metadata?: any;

  constructor(message: string, statusCode = 500, errorCode = "INTERNAL_SERVER_ERROR", metadata?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.metadata = metadata;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", metadata?: any) {
    super(message, 400, "VALIDATION_ERROR", metadata);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Not authorized to access this resource") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed", metadata?: any) {
    super(message, 500, "DATABASE_ERROR", metadata);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", metadata?: any) {
    super(message, 409, "CONFLICT_ERROR", metadata);
  }
}
