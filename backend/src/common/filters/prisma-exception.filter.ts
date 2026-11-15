import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

const errors: Record<string, { status: number; message: string }> = {
  P2000: { status: HttpStatus.BAD_REQUEST, message: 'A value is too long for this field' },
  P2002: { status: HttpStatus.CONFLICT, message: 'A record with this unique value already exists' },
  P2003: { status: HttpStatus.BAD_REQUEST, message: 'The related record does not exist' },
  P2011: { status: HttpStatus.BAD_REQUEST, message: 'A required value is missing' },
  P2014: { status: HttpStatus.CONFLICT, message: 'This change conflicts with a required relation' },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Record not found' },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const error = errors[exception.code] ?? {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database operation failed',
    };

    response.status(error.status).json({ statusCode: error.status, message: error.message });
  }
}
