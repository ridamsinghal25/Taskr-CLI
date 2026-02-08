export const ErrorMessageEnum = {
  NOT_AUTHENTICATED: "You are not logged in. Please run login command first.",
  NOT_AUTHORIZED: "You are not authorized to access this resource.",
  NOT_FOUND: "Resource not found.",
  INTERNAL_SERVER_ERROR: "Internal server error.",
} as const;

export type ErrorMessageEnumType = keyof typeof ErrorMessageEnum;