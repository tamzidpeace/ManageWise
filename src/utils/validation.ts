import { ZodError } from 'zod';
import { NextResponse } from 'next/server';

export function handleZodError(error: ZodError) {
  return NextResponse.json(
    {
      success: false,
      message: 'Validation failed',
      errors: error.flatten(),
    },
    { status: 400 }
  );
}