/**
 * @file payment.dto.ts
 * @description Data Transfer Objects for payment operations.
 */

// Destination: Used in PaymentController and PaymentService for type safety
export interface CreateCheckoutSessionDto {
  gameIds: string[];
}
