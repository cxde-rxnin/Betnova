import { NextResponse } from "next/server";

export function successResponse(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created(data: any) {
  return successResponse(data, 201);
}

export function errorResponse(message: string, status = 400, errors?: any, code?: string) {
  return NextResponse.json({ success: false, error: message, errorCode: code, errors }, { status });
}

export function badRequest(message: string = "Bad Request", errors?: any) {
  return errorResponse(message, 400, errors, "BAD_REQUEST");
}

export function unauthorized(message: string = "Unauthorized") {
  return errorResponse(message, 401, undefined, "UNAUTHORIZED");
}

export function forbidden(message: string = "Forbidden") {
  return errorResponse(message, 403, undefined, "FORBIDDEN");
}

export function notFound(message: string = "Not Found") {
  return errorResponse(message, 404, undefined, "NOT_FOUND");
}

export function conflict(message: string = "Conflict") {
  return errorResponse(message, 409, undefined, "CONFLICT");
}

export function serverError(message: string = "Internal Server Error", errors?: any) {
  return errorResponse(message, 500, errors, "INTERNAL_SERVER_ERROR");
}
